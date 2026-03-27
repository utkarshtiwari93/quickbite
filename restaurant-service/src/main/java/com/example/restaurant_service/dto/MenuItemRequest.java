package com.example.restaurant_service.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record MenuItemRequest(
        @NotBlank String name,
        String description,
        @NotNull BigDecimal price,
        boolean isVeg,
        String imageUrl
) {}