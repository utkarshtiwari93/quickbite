package com.example.user_service.service;

import com.example.user_service.dto.*;
import com.example.user_service.entity.*;
import com.example.user_service.repository.*;
import com.example.user_service.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        // Check duplicates
        if (userRepository.existsByEmail(request.email()))
            throw new RuntimeException("Email already registered");
        if (userRepository.existsByPhone(request.phone()))
            throw new RuntimeException("Phone already registered");

        // Determine role
        User.Role role = User.Role.CUSTOMER;
        if (request.role() != null) {
            try { role = User.Role.valueOf(request.role().toUpperCase()); }
            catch (Exception ignored) {}
        }

        // Save user
        User user = User.builder()
                .email(request.email())
                .phone(request.phone())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(role)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        return generateTokens(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash()))
            throw new RuntimeException("Invalid email or password");

        if (!user.isActive())
            throw new RuntimeException("Account is deactivated");

        // Revoke old tokens
        refreshTokenRepository.revokeAllUserTokens(user.getId());

        return generateTokens(user);
    }

    @Transactional
    public TokenResponse refreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (refreshToken.isRevoked())
            throw new RuntimeException("Refresh token has been revoked");

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Refresh token has expired");

        // Rotate refresh token
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        return generateTokens(refreshToken.getUser());
    }

    private TokenResponse generateTokens(User user) {
        String accessToken = jwtService.generateAccessToken(
                user.getId().toString(), user.getRole().name());
        String refreshTokenStr = jwtService.generateRefreshToken(
                user.getId().toString());

        // Save refresh token to DB
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(refreshToken);

        return new TokenResponse(
                accessToken,
                refreshTokenStr,
                "Bearer",
                user.getId(),
                user.getRole().name()
        );
    }
}