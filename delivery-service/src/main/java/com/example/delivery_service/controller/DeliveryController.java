package com.example.delivery_service.controller;

import com.example.delivery_service.dto.*;
import com.example.delivery_service.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@Controller
@RequestMapping("/api/v1/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    // Register as delivery agent
    @PostMapping("/agent/register")
    @ResponseBody
    public ResponseEntity<?> registerAgent(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody AgentRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("success", true,
                        "data", deliveryService
                                .registerAgent(userId, request)));
    }

    // Toggle agent availability
    @PatchMapping("/agent/availability")
    @ResponseBody
    public ResponseEntity<?> toggleAvailability(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(Map.of("success", true,
                "data", deliveryService.toggleAvailability(userId)));
    }

    // Track order delivery
    @GetMapping("/{orderId}/track")
    @ResponseBody
    public ResponseEntity<?> trackOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(Map.of("success", true,
                "data", deliveryService.trackOrder(orderId)));
    }

    // Update delivery status
    @PatchMapping("/{orderId}/status")
    @ResponseBody
    public ResponseEntity<?> updateStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody DeliveryStatusRequest request) {
        return ResponseEntity.ok(Map.of("success", true,
                "data", deliveryService.updateStatus(orderId, request)));
    }

    // WebSocket — driver sends location updates
    @MessageMapping("/location")
    public void handleLocationUpdate(
            LocationUpdateRequest request,
            org.springframework.messaging.simp.SimpMessageHeaderAccessor headerAccessor) {
        String userId = (String) headerAccessor.getSessionAttributes()
                .get("userId");
        if (userId != null) {
            deliveryService.updateLocation(Long.parseLong(userId), request);
        }
    }

    // REST fallback for location update
    @PostMapping("/agent/location")
    @ResponseBody
    public ResponseEntity<?> updateLocationRest(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody LocationUpdateRequest request) {
        deliveryService.updateLocation(userId, request);
        return ResponseEntity.ok(Map.of("success", true,
                "message", "Location updated"));
    }
}