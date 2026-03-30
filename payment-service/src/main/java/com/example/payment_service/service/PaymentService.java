package com.example.payment_service.service;

import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.entity.Payment;
import com.example.payment_service.kafka.PaymentEventPublisher;
import com.example.payment_service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final WalletService walletService;
    private final PaymentEventPublisher eventPublisher;

    @Transactional
    public void processPayment(Long orderId, Long customerId,
                               BigDecimal amount) {
        // Idempotency check — prevent duplicate payments
        String idempotencyKey = "order-" + orderId;
        if (paymentRepository.findByIdempotencyKey(idempotencyKey).isPresent()) {
            log.warn("Duplicate payment attempt for order: {}", orderId);
            return;
        }

        // Create payment record
        Payment payment = Payment.builder()
                .orderId(orderId)
                .customerId(customerId)
                .idempotencyKey(idempotencyKey)
                .amount(amount)
                .currency("INR")        // ← add this
                .method("WALLET")       // ← add this
                .status(Payment.PaymentStatus.PENDING)
                .build();
        payment = paymentRepository.save(payment);

        // Try to deduct from wallet
        boolean success = walletService.deductBalance(
                customerId, amount, "Payment for order #" + orderId);

        if (success) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setCompletedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            // Publish success → Order Service will confirm order
            eventPublisher.publishPaymentCompleted(orderId, customerId, amount);
            log.info("Payment SUCCESS for order: {}", orderId);
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setFailureReason("Insufficient wallet balance");
            paymentRepository.save(payment);

            // Publish failure → Order Service will cancel order
            eventPublisher.publishPaymentFailed(orderId, "Insufficient balance");
            log.info("Payment FAILED for order: {}", orderId);
        }
    }

    @Transactional
    public void processRefund(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElse(null);

        if (payment == null || payment.getStatus() != Payment.PaymentStatus.SUCCESS) {
            log.warn("No successful payment found for order: {}", orderId);
            return;
        }

        // Refund to wallet
        walletService.refundBalance(payment.getCustomerId(),
                payment.getAmount(), "Refund for order #" + orderId);

        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        log.info("Refund processed for order: {}", orderId);
    }

    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return toResponse(payment);
    }

    private PaymentResponse toResponse(Payment p) {
        return new PaymentResponse(p.getId(), p.getOrderId(),
                p.getAmount(), p.getMethod(),
                p.getStatus().name(),
                p.getInitiatedAt(), p.getCompletedAt());
    }
}