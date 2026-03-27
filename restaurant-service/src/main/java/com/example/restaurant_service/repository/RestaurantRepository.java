package com.example.restaurant_service.repository;


import com.example.restaurant_service.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByIsActiveTrueAndIsOpenTrue();
    List<Restaurant> findByOwnerIdAndIsActiveTrue(Long ownerId);
    List<Restaurant> findByCityAndIsActiveTrueAndIsOpenTrue(String city);
}