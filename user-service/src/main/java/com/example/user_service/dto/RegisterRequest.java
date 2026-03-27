package com.example.user_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email
        String email,

        @NotBlank @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
        String phone,

        @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
        String password,

        @NotBlank
        String fullName,

        String role   // optional — defaults to CUSTOMER
) {}