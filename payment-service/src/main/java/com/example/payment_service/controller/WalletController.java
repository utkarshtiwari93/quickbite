package com.example.payment_service.controller;

import  com.example.payment_service.dto.TopUpRequest;
import  com.example.payment_service.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(Map.of("success", true,
                "data", walletService.getBalance(userId)));
    }

    @PostMapping("/topup")
    public ResponseEntity<?> topUp(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody TopUpRequest request) {
        return ResponseEntity.ok(Map.of("success", true,
                "data", walletService.topUp(userId, request.amount())));
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(
            @RequestHeader("X-User-Id") Long userId) {
        var wallet = walletService.getOrCreateWallet(userId);
        return ResponseEntity.ok(Map.of("success", true,
                "data", wallet));
    }
}