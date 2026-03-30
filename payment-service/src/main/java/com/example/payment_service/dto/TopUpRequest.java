// TopUpRequest.java
package com.example.payment_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TopUpRequest(
        @NotNull @Min(1) BigDecimal amount
) {}