// PaymentResponse.java
package com.example.payment_service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        Long orderId,
        BigDecimal amount,
        String method,
        String status,
        LocalDateTime initiatedAt,
        LocalDateTime completedAt
) {}