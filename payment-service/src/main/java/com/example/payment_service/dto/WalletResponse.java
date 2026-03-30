// WalletResponse.java
package com.example.payment_service.dto;

import java.math.BigDecimal;

public record WalletResponse(
        Long id,
        Long userId,
        BigDecimal balance
) {}