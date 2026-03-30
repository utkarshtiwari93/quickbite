package com.example.payment_service.service;

import com.example.payment_service.dto.*;
import com.example.payment_service.entity.*;
import com.example.payment_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;

    // Auto-create wallet on first access
    public Wallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(
                        Wallet.builder()
                                .userId(userId)
                                .balance(BigDecimal.ZERO)
                                .build()));
    }

    public WalletResponse getBalance(Long userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return new WalletResponse(wallet.getId(),
                wallet.getUserId(), wallet.getBalance());
    }

    @Transactional
    public WalletResponse topUp(Long userId, BigDecimal amount) {
        Wallet wallet = getOrCreateWallet(userId);
        wallet.setBalance(wallet.getBalance().add(amount));
        wallet = walletRepository.save(wallet);

        // Save transaction record
        transactionRepository.save(WalletTransaction.builder()
                .walletId(wallet.getId())
                .amount(amount)
                .type(WalletTransaction.TransactionType.CREDIT)
                .description("Wallet top-up")
                .build());

        log.info("Wallet topped up for user: {} amount: {}", userId, amount);
        return new WalletResponse(wallet.getId(),
                wallet.getUserId(), wallet.getBalance());
    }

    @Transactional
    public boolean deductBalance(Long userId, BigDecimal amount,
                                 String description) {
        // Pessimistic lock to prevent race conditions
        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (wallet.getBalance().compareTo(amount) < 0) {
            log.warn("Insufficient balance for user: {}", userId);
            return false;
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        transactionRepository.save(WalletTransaction.builder()
                .walletId(wallet.getId())
                .amount(amount)
                .type(WalletTransaction.TransactionType.DEBIT)
                .description(description)
                .build());

        return true;
    }

    @Transactional
    public void refundBalance(Long userId, BigDecimal amount,
                              String description) {
        Wallet wallet = getOrCreateWallet(userId);
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        transactionRepository.save(WalletTransaction.builder()
                .walletId(wallet.getId())
                .amount(amount)
                .type(WalletTransaction.TransactionType.CREDIT)
                .description(description)
                .build());

        log.info("Refunded {} to user: {}", amount, userId);
    }
}