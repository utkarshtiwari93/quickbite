package com.example.restaurant_service.dto;


import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RestaurantResponse(
        Long id,
        String name,
        String description,
        String cuisineType,
        String address,
        String city,
        BigDecimal avgRating,
        Integer deliveryTime,
        BigDecimal minOrder,
        boolean isOpen,
        LocalDateTime createdAt
) {}