package com.example.restaurant_service.controller;


import com.example.restaurant_service.dto.*;
import com.example.restaurant_service.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/{restaurantId}/menu")
    public ResponseEntity<?> getMenu(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(
                Map.of("success", true,
                        "data", menuService.getMenu(restaurantId)));
    }

    @PostMapping("/{restaurantId}/categories")
    public ResponseEntity<?> addCategory(
            @PathVariable Long restaurantId,
            @Valid @RequestBody MenuCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("success", true,
                        "data", menuService.addCategory(restaurantId, request)));
    }

    @PostMapping("/{restaurantId}/categories/{categoryId}/items")
    public ResponseEntity<?> addMenuItem(
            @PathVariable Long restaurantId,
            @PathVariable Long categoryId,
            @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("success", true,
                        "data", menuService.addMenuItem(restaurantId, categoryId, request)));
    }
}