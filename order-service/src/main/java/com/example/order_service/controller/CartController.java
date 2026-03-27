package com.example.order_service.controller;

import com.example.order_service.dto.CartItemRequest;
import com.example.order_service.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/items")
    public ResponseEntity<?> addItem(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CartItemRequest request) {
        cartService.addItem(userId, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Item added to cart",
                "total", cartService.getCartTotal(userId)));
    }

    @GetMapping
    public ResponseEntity<?> getCart(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "items", cartService.getCart(userId),
                "total", cartService.getCartTotal(userId)));
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart(
            @RequestHeader("X-User-Id") Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(Map.of("success", true,
                "message", "Cart cleared"));
    }
}