package com.example.restaurant_service.kafka;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;

@Slf4j
@Component
public class RestaurantEventPublisher {

    @Autowired(required = false)  // ← makes Kafka optional
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void publishMenuUpdated(Long restaurantId) {
        if (kafkaTemplate == null) {
            log.warn("Kafka not available - skipping MenuUpdated event");
            return;
        }
        Map<String, Object> event = Map.of(
                "type", "MENU_UPDATED",
                "restaurantId", restaurantId,
                "timestamp", System.currentTimeMillis()
        );
        kafkaTemplate.send("restaurant-events", restaurantId.toString(), event);
        log.info("Published MENU_UPDATED event for restaurant: {}", restaurantId);
    }

    public void publishStatusChanged(Long restaurantId, boolean isOpen) {
        if (kafkaTemplate == null) {
            log.warn("Kafka not available - skipping StatusChanged event");
            return;
        }
        Map<String, Object> event = Map.of(
                "type", "STATUS_CHANGED",
                "restaurantId", restaurantId,
                "isOpen", isOpen,
                "timestamp", System.currentTimeMillis()
        );
        kafkaTemplate.send("restaurant-events", restaurantId.toString(), event);
        log.info("Published STATUS_CHANGED event for restaurant: {}", restaurantId);
    }
}