package com.example.restaurant_service.service;


import com.example.restaurant_service.dto.*;
import com.example.restaurant_service.entity.Restaurant;
import com.example.restaurant_service.kafka.RestaurantEventPublisher;
import com.example.restaurant_service.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantEventPublisher eventPublisher;

    @Transactional
    public RestaurantResponse createRestaurant(RestaurantRequest request, Long ownerId) {
        Restaurant restaurant = Restaurant.builder()
                .ownerId(ownerId)
                .name(request.name())
                .description(request.description())
                .cuisineType(request.cuisineType())
                .address(request.address())
                .city(request.city())
                .lat(request.lat())
                .lng(request.lng())
                .phone(request.phone())
                .email(request.email())
                .deliveryTime(request.deliveryTime() != null ? request.deliveryTime() : 30)
                .minOrder(request.minOrder())
                .build();

        restaurant = restaurantRepository.save(restaurant);
        return toResponse(restaurant);
    }

    @Cacheable(value = "restaurants", key = "#id")
    public RestaurantResponse getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        return toResponse(restaurant);
    }

    public List<RestaurantResponse> getOpenRestaurants() {
        return restaurantRepository.findByIsActiveTrueAndIsOpenTrue()
                .stream().map(this::toResponse).toList();
    }

    public List<RestaurantResponse> getRestaurantsByCity(String city) {
        return restaurantRepository.findByCityAndIsActiveTrueAndIsOpenTrue(city)
                .stream().map(this::toResponse).toList();
    }

    @CacheEvict(value = "restaurants", key = "#id")
    @Transactional
    public RestaurantResponse toggleStatus(Long id, Long ownerId) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        if (!restaurant.getOwnerId().equals(ownerId))
            throw new RuntimeException("Not authorized to update this restaurant");

        restaurant.setOpen(!restaurant.isOpen());
        restaurant = restaurantRepository.save(restaurant);

        eventPublisher.publishStatusChanged(id, restaurant.isOpen());
        return toResponse(restaurant);
    }

    private RestaurantResponse toResponse(Restaurant r) {
        return new RestaurantResponse(
                r.getId(), r.getName(), r.getDescription(),
                r.getCuisineType(), r.getAddress(), r.getCity(),
                r.getAvgRating(), r.getDeliveryTime(),
                r.getMinOrder(), r.isOpen(), r.getCreatedAt()
        );
    }
}