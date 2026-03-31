package com.example.delivery_service.kafka;

import com.example.delivery_service.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeliveryEventConsumer {

    private final DeliveryService deliveryService;

    @KafkaListener(topics = "payment-events",
            groupId = "delivery-service")
    public void handlePaymentEvent(Map<String, Object> event) {
        String type = (String) event.get("type");

        if ("PAYMENT_COMPLETED".equals(type)) {
            Long orderId = ((Number) event.get("orderId")).longValue();
            Long customerId = ((Number) event.get("customerId")).longValue();
            log.info("Payment completed for order: {} - assigning driver", orderId);
            deliveryService.assignDriver(orderId, customerId);
        }
    }
}