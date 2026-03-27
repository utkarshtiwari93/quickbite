package com.example.restaurant_service.repository;


import com.example.restaurant_service.entity.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {
    List<MenuCategory> findByRestaurantIdAndIsActiveTrue(Long restaurantId);
}