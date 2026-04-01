package com.example.notification_service.service;

import com.example.notification_service.entity.Notification;
import com.example.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void createNotification(Long userId, String title,
                                   String message, String type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .build();
        notificationRepository.save(notification);
        log.info("Notification created for user: {} type: {}",
                userId, type);

        // In production: send Firebase push, SMS via Twilio,
        // Email via SendGrid here
        // For now we just store in DB
        simulateNotification(userId, title, message);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Map<String, Object> getUnreadCount(Long userId) {
        long count = notificationRepository
                .countByUserIdAndIsReadFalse(userId);
        return Map.of("unreadCount", count);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId)
                .ifPresent(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository
                .findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    // Handle all Kafka events
    public void handleEvent(Map<String, Object> event) {
        String type = (String) event.get("type");
        log.info("Processing notification for event: {}", type);

        switch (type) {
            case "ORDER_CREATED" -> {
                Long customerId = ((Number) event.get("customerId")).longValue();
                Long orderId = ((Number) event.get("orderId")).longValue();
                createNotification(customerId,
                        "Order Placed! 🎉",
                        "Your order #" + orderId + " has been placed successfully!",
                        "ORDER");
            }
            case "PAYMENT_COMPLETED" -> {
                Long customerId = ((Number) event.get("customerId")).longValue();
                Long orderId = ((Number) event.get("orderId")).longValue();
                createNotification(customerId,
                        "Payment Successful! 💰",
                        "Payment confirmed for order #" + orderId,
                        "PAYMENT");
            }
            case "PAYMENT_FAILED" -> {
                Long orderId = ((Number) event.get("orderId")).longValue();
                createNotification(1L, // fallback userId
                        "Payment Failed! ❌",
                        "Payment failed for order #" + orderId
                                + ". Please try again.",
                        "PAYMENT");
            }
            case "DRIVER_ASSIGNED" -> {
                Long customerId = ((Number) event.get("customerId")).longValue();
                Long orderId = ((Number) event.get("orderId")).longValue();
                createNotification(customerId,
                        "Driver Assigned! 🚗",
                        "A driver is on the way for order #" + orderId,
                        "DELIVERY");
            }
            case "ORDER_PICKED_UP" -> {
                Long orderId = ((Number) event.get("orderId")).longValue();
                createNotification(1L,
                        "Order Picked Up! 🍕",
                        "Your order #" + orderId
                                + " has been picked up by the driver!",
                        "DELIVERY");
            }
            case "ORDER_DELIVERED" -> {
                Long orderId = ((Number) event.get("orderId")).longValue();
                createNotification(1L,
                        "Order Delivered! ✅",
                        "Your order #" + orderId
                                + " has been delivered. Enjoy your meal!",
                        "DELIVERY");
            }
        }
    }

    private void simulateNotification(Long userId,
                                      String title, String message) {
        // Simulate push notification
        log.info("📱 PUSH NOTIFICATION → User {}: {} - {}",
                userId, title, message);
        // In production:
        // firebaseService.sendPush(userId, title, message);
        // twilioService.sendSMS(userId, message);
        // sendGridService.sendEmail(userId, title, message);
    }
}