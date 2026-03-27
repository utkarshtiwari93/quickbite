package com.example.restaurant_service.dto;


import jakarta.validation.constraints.NotBlank;

public record MenuCategoryRequest(
        @NotBlank String name,
        String description,
        Integer displayOrder
) {}