package com.example.order_service.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishOrderCreated(Long orderId, Long customerId,
                                    Long restaurantId, java.math.BigDecimal amount) {
        Map<String, Object> event = Map.of(
                "type", "ORDER_CREATED",
                "orderId", orderId,
                "customerId", customerId,
                "restaurantId", restaurantId,
                "amount", amount.toString(),
                "timestamp", System.currentTimeMillis()
        );
        kafkaTemplate.send("order-events", orderId.toString(), event);
        log.info("Published ORDER_CREATED event for order: {}", orderId);
    }

    public void publishOrderCancelled(Long orderId) {
        Map<String, Object> event = Map.of(
                "type", "ORDER_CANCELLED",
                "orderId", orderId,
                "timestamp", System.currentTimeMillis()
        );
        kafkaTemplate.send("order-events", orderId.toString(), event);
        log.info("Published ORDER_CANCELLED event for order: {}", orderId);
    }
}