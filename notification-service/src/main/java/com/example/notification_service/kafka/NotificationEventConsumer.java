package com.example.notification_service.kafka;

import com.example.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "order-events",
            groupId = "notification-service")
    public void handleOrderEvent(Map<String, Object> event) {
        notificationService.handleEvent(event);
    }

    @KafkaListener(topics = "payment-events",
            groupId = "notification-service")
    public void handlePaymentEvent(Map<String, Object> event) {
        notificationService.handleEvent(event);
    }

    @KafkaListener(topics = "delivery-events",
            groupId = "notification-service")
    public void handleDeliveryEvent(Map<String, Object> event) {
        notificationService.handleEvent(event);
    }
}