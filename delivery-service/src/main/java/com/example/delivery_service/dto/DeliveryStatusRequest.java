package com.example.delivery_service.dto;

import jakarta.validation.constraints.NotBlank;

public record DeliveryStatusRequest(
        @NotBlank String status
) {}