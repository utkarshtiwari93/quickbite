package com.example.user_service.dto;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        Long userId,
        String role
) {}