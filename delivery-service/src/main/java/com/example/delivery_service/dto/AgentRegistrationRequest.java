package com.example.delivery_service.dto;

import jakarta.validation.constraints.NotBlank;

public record AgentRegistrationRequest(
        @NotBlank String name,
        @NotBlank String phone
) {}