package com.example.restaurant_service.repository;


import com.example.restaurant_service.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCategoryIdAndIsAvailableTrue(Long categoryId);
    List<MenuItem> findByRestaurantIdAndIsAvailableTrue(Long restaurantId);
}