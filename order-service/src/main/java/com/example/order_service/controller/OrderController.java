package com.example.order_service.controller;

import com.example.order_service.dto.PlaceOrderRequest;
import com.example.order_service.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<?> placeOrder(
            @RequestHeader("X-User-Id") Long customerId,
            @Valid @RequestBody PlaceOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("success", true,
                        "data", orderService.placeOrder(customerId, request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true,
                "data", orderService.getOrder(id)));
    }

    @GetMapping
    public ResponseEntity<?> getMyOrders(
            @RequestHeader("X-User-Id") Long customerId) {
        return ResponseEntity.ok(Map.of("success", true,
                "data", orderService.getCustomerOrders(customerId)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long customerId) {
        orderService.cancelOrder(id, "Cancelled by customer");
        return ResponseEntity.ok(Map.of("success", true,
                "message", "Order cancelled"));
    }
}