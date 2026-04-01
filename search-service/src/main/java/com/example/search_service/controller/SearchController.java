package com.example.search_service.controller;

import com.example.search_service.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    // Main search endpoint
    @GetMapping("/restaurants")
    public ResponseEntity<?> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String cuisine) {

        var results = q != null ? searchService.searchByQuery(q)
                : city != null ? searchService.searchByCity(city)
                : cuisine != null ? searchService.searchByCuisine(cuisine)
                : searchService.getAllOpen();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", results.size(),
                "data", results));
    }

    // Manually index a restaurant for testing
    @PostMapping("/restaurants/index")
    public ResponseEntity<?> indexRestaurant(
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", searchService.indexFromRequest(request)));
    }

    // Trending restaurants
    @GetMapping("/trending")
    public ResponseEntity<?> trending() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", searchService.getAllOpen()));
    }
}