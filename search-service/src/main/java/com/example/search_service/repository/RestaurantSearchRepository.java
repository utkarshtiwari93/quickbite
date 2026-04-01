package com.example.search_service.repository;

import com.example.search_service.document.RestaurantDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import java.util.List;
import java.util.Optional;

public interface RestaurantSearchRepository
        extends ElasticsearchRepository<RestaurantDocument, String> {
    List<RestaurantDocument> findByNameContainingIgnoreCase(String name);
    List<RestaurantDocument> findByCuisineTypeAndIsOpenTrue(String cuisineType);
    List<RestaurantDocument> findByCityAndIsOpenTrue(String city);
    Optional<RestaurantDocument> findByRestaurantId(Long restaurantId);
}