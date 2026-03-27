package com.example.restaurant_service.dto;


import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record RestaurantRequest(
        @NotBlank String name,
        String description,
        String cuisineType,
        @NotBlank String address,
        @NotBlank String city,
        BigDecimal lat,
        BigDecimal lng,
        String phone,
        String email,
        Integer deliveryTime,
        BigDecimal minOrder
) {}