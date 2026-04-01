package com.example.search_service.service;

import com.example.search_service.document.RestaurantDocument;
import com.example.search_service.repository.RestaurantSearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final RestaurantSearchRepository searchRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    // Index a restaurant
    public void indexRestaurant(RestaurantDocument document) {
        searchRepository.save(document);
        log.info("Indexed restaurant: {}", document.getName());
    }

    // Search by name or description
    public List<RestaurantDocument> searchByQuery(String query) {
        Criteria criteria = new Criteria("name").contains(query)
                .or(new Criteria("description").contains(query))
                .or(new Criteria("cuisineType").contains(query));

        CriteriaQuery criteriaQuery = new CriteriaQuery(criteria);
        SearchHits<RestaurantDocument> hits = elasticsearchOperations
                .search(criteriaQuery, RestaurantDocument.class);

        return hits.stream()
                .map(hit -> hit.getContent())
                .collect(Collectors.toList());
    }

    // Search by city
    public List<RestaurantDocument> searchByCity(String city) {
        return searchRepository.findByCityAndIsOpenTrue(city);
    }

    // Search by cuisine
    public List<RestaurantDocument> searchByCuisine(String cuisine) {
        return searchRepository
                .findByCuisineTypeAndIsOpenTrue(cuisine);
    }

    // Get all open restaurants
    public List<RestaurantDocument> getAllOpen() {
        List<RestaurantDocument> all = new ArrayList<>();
        searchRepository.findAll().forEach(all::add);  // ← fix this line
        return all.stream()
                .filter(RestaurantDocument::isOpen)
                .collect(Collectors.toList());
    }

    // Update restaurant in index
    public void updateRestaurant(Map<String, Object> event) {
        Long restaurantId = ((Number) event
                .get("restaurantId")).longValue();

        searchRepository.findByRestaurantId(restaurantId)
                .ifPresent(doc -> {
                    if (event.containsKey("isOpen")) {
                        doc.setOpen((Boolean) event.get("isOpen"));
                        searchRepository.save(doc);
                        log.info("Updated restaurant {} in index",
                                restaurantId);
                    }
                });
    }

    // Manually index a restaurant from request
    public RestaurantDocument indexFromRequest(
            Map<String, Object> request) {
        RestaurantDocument doc = RestaurantDocument.builder()
                .restaurantId(((Number) request
                        .get("restaurantId")).longValue())
                .name((String) request.get("name"))
                .description((String) request.get("description"))
                .cuisineType((String) request.get("cuisineType"))
                .city((String) request.get("city"))
                .isOpen(true)
                .isActive(true)
                .build();

        return searchRepository.save(doc);
    }
}