package com.example.payment_service.controller;

import com.example.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getPayment(@PathVariable Long orderId) {
        return ResponseEntity.ok(Map.of("success", true,
                "data", paymentService.getPaymentByOrderId(orderId)));
    }

    @PostMapping("/{orderId}/refund")
    public ResponseEntity<?> refund(@PathVariable Long orderId) {
        paymentService.processRefund(orderId);
        return ResponseEntity.ok(Map.of("success", true,
                "message", "Refund processed"));
    }
}