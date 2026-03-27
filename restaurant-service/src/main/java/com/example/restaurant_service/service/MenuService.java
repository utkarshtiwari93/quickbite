package com.example.restaurant_service.service;


import com.example.restaurant_service.dto.*;
import com.example.restaurant_service.entity.*;
import com.example.restaurant_service.kafka.RestaurantEventPublisher;
import com.example.restaurant_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantEventPublisher eventPublisher;

    @Transactional
    public MenuCategory addCategory(Long restaurantId, MenuCategoryRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        MenuCategory category = MenuCategory.builder()
                .restaurant(restaurant)
                .name(request.name())
                .description(request.description())
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .build();

        return categoryRepository.save(category);
    }

    @Cacheable(value = "menus", key = "#restaurantId")
    public List<MenuCategory> getMenu(Long restaurantId) {
        return categoryRepository.findByRestaurantIdAndIsActiveTrue(restaurantId);
    }

    @CacheEvict(value = "menus", key = "#restaurantId")
    @Transactional
    public MenuItem addMenuItem(Long restaurantId, Long categoryId,
                                MenuItemRequest request) {
        MenuCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        MenuItem item = MenuItem.builder()
                .category(category)
                .restaurantId(restaurantId)
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .isVeg(request.isVeg())
                .imageUrl(request.imageUrl())
                .build();

        item = menuItemRepository.save(item);
        eventPublisher.publishMenuUpdated(restaurantId);
        return item;
    }
}