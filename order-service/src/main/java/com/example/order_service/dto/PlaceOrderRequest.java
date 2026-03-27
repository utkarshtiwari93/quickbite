package com.example.order_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PlaceOrderRequest(
        @NotNull Long restaurantId,
        @NotBlank String deliveryAddress,
        BigDecimal deliveryLat,
        BigDecimal deliveryLng,
        String paymentMethod,
        String specialInstructions
) {}