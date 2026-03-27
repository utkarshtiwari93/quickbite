package com.example.order_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CartItemRequest(
        @NotNull Long menuItemId,
        @NotNull String itemName,
        @NotNull @Min(1) Integer quantity,
        @NotNull java.math.BigDecimal unitPrice,
        @NotNull Long restaurantId
) {}