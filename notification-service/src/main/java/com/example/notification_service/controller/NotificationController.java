package com.example.notification_service.controller;

import com.example.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", notificationService
                        .getUserNotifications(userId)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", notificationService.getUnreadCount(userId)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Marked as read"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(
            @RequestHeader("X-User-Id") Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "All marked as read"));
    }
}