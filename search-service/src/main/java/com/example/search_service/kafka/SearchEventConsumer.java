package com.example.search_service.kafka;

import com.example.search_service.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class SearchEventConsumer {

    private final SearchService searchService;

    @KafkaListener(topics = "restaurant-events",
            groupId = "search-service")
    public void handleRestaurantEvent(Map<String, Object> event) {
        String type = (String) event.get("type");
        log.info("Received restaurant event: {}", type);

        switch (type) {
            case "STATUS_CHANGED" ->
                    searchService.updateRestaurant(event);
            case "MENU_UPDATED" ->
                    log.info("Menu updated for restaurant: {}",
                            event.get("restaurantId"));
        }
    }
}