package com.example.delivery_service.dto;

import jakarta.validation.constraints.NotNull;

public record LocationUpdateRequest(
        @NotNull Double latitude,
        @NotNull Double longitude
) {}