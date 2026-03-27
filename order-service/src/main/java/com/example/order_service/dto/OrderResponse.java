package com.example.order_service.dto;

import com.example.order_service.entity.Order;
import com.example.order_service.entity.OrderItem;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        Long customerId,
        Long restaurantId,
        String status,
        BigDecimal totalAmount,
        String deliveryAddress,
        Integer estimatedTime,
        String paymentMethod,
        LocalDateTime placedAt,
        List<OrderItem> items
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerId(),
                order.getRestaurantId(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getDeliveryAddress(),
                order.getEstimatedTime(),
                order.getPaymentMethod(),
                order.getPlacedAt(),
                order.getItems()
        );
    }
}