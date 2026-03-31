package com.example.delivery_service.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeliveryEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishDriverAssigned(Long orderId,
                                      String agentId, Long customerId) {
        Map<String, Object> event = Map.of(
                "type", "DRIVER_ASSIGNED",
                "orderId", orderId,
                "agentId", agentId,
                "customerId", customerId,
                "timestamp", System.currentTimeMillis()
        );
        kafkaTemplate.send("delivery-events",
                orderId.toString(), event);
        log.info("Published DRIVER_ASSIGNED for order: {}", orderId);
    }

    public void publishOrderPickedUp(Long orderId) {
        Map<String, Object> event = Map.of(
                "type", "ORDER_PICKED_UP",
                "orderId", orderId,
                "timestamp", System.currentTimeMillis()
        );
        kafkaTemplate.send("delivery-events",
                orderId.toString(), event);
        log.info("Published ORDER_PICKED_UP for order: {}", orderId);
    }

    public void publishOrderDelivered(Long orderId) {
        Map<String, Object> event = Map.of(
                "type", "ORDER_DELIVERED",
                "orderId", orderId,
                "timestamp", System.currentTimeMillis()
        );
        kafkaTemplate.send("delivery-events",
                orderId.toString(), event);
        log.info("Published ORDER_DELIVERED for order: {}", orderId);
    }
}