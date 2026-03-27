package com.example.restaurant_service.controller;


import com.example.restaurant_service.dto.*;
import com.example.restaurant_service.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping
    public ResponseEntity<?> createRestaurant(
            @Valid @RequestBody RestaurantRequest request,
            @RequestHeader("X-User-Id") Long ownerId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("success", true,
                        "data", restaurantService.createRestaurant(request, ownerId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRestaurant(@PathVariable Long id) {
        return ResponseEntity.ok(
                Map.of("success", true,
                        "data", restaurantService.getRestaurantById(id)));
    }

    @GetMapping
    public ResponseEntity<?> getRestaurants(
            @RequestParam(required = false) String city) {
        var restaurants = city != null
                ? restaurantService.getRestaurantsByCity(city)
                : restaurantService.getOpenRestaurants();
        return ResponseEntity.ok(Map.of("success", true, "data", restaurants));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> toggleStatus(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long ownerId) {
        return ResponseEntity.ok(
                Map.of("success", true,
                        "data", restaurantService.toggleStatus(id, ownerId)));
    }
}