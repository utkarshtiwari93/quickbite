package com.example.order_service.service;

import com.example.order_service.dto.*;
import com.example.order_service.entity.*;
import com.example.order_service.kafka.OrderEventPublisher;
import com.example.order_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartService cartService;
    private final OrderEventPublisher eventPublisher;

    @Transactional
    public OrderResponse placeOrder(Long customerId, PlaceOrderRequest request) {
        // Get cart items
        List<Map<String, Object>> cartItems = cartService.getCart(customerId);
        if (cartItems.isEmpty())
            throw new RuntimeException("Cart is empty!");

        // Calculate total
        BigDecimal total = cartService.getCartTotal(customerId);

        // Generate order number
        String orderNumber = generateOrderNumber();

        // Build order
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customerId(customerId)
                .restaurantId(request.restaurantId())
                .status(Order.OrderStatus.PENDING)
                .totalAmount(total)
                .deliveryAddress(request.deliveryAddress())
                .deliveryLat(request.deliveryLat())
                .deliveryLng(request.deliveryLng())
                .paymentMethod(request.paymentMethod() != null
                        ? request.paymentMethod() : "ONLINE")
                .specialInstructions(request.specialInstructions())
                .build();

        order = orderRepository.save(order);

        // Save order items
        final Order savedOrder = order;
        List<OrderItem> items = cartItems.stream().map(item ->
                OrderItem.builder()
                        .order(savedOrder)
                        .menuItemId(((Number) item.get("menuItemId")).longValue())
                        .itemName((String) item.get("itemName"))
                        .quantity(((Number) item.get("quantity")).intValue())
                        .unitPrice(new BigDecimal(item.get("unitPrice").toString()))
                        .totalPrice(new BigDecimal(item.get("unitPrice").toString())
                                .multiply(BigDecimal.valueOf(
                                        ((Number) item.get("quantity")).longValue())))
                        .build()
        ).toList();

        orderItemRepository.saveAll(items);
        order.setItems(items);

        // Clear cart
        cartService.clearCart(customerId);

        // Publish Kafka event → triggers Payment Service
        eventPublisher.publishOrderCreated(
                order.getId(), customerId,
                request.restaurantId(), total);

        log.info("Order placed: {} for customer: {}", orderNumber, customerId);
        return OrderResponse.from(order);
    }

    @Transactional
    public void confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.OrderStatus.CONFIRMED);
        order.setConfirmedAt(LocalDateTime.now());
        orderRepository.save(order);
        log.info("Order confirmed: {}", orderId);
    }

    @Transactional
    public void cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
        log.info("Order cancelled: {} reason: {}", orderId, reason);
    }

    public OrderResponse getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return OrderResponse.from(order);
    }

    public List<OrderResponse> getCustomerOrders(Long customerId) {
        return orderRepository
                .findByCustomerIdOrderByPlacedAtDesc(customerId)
                .stream().map(OrderResponse::from).toList();
    }

    private String generateOrderNumber() {
        String date = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String sequence = String.valueOf(System.currentTimeMillis()).substring(8);
        return "QB-" + date + "-" + sequence;
    }
}