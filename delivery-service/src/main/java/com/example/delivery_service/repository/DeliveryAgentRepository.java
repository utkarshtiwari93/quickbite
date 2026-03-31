package com.example.delivery_service.repository;

import com.example.delivery_service.document.DeliveryAgent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.util.Optional;

public interface DeliveryAgentRepository
        extends MongoRepository<DeliveryAgent, String> {

    Optional<DeliveryAgent> findByUserId(Long userId);
    List<DeliveryAgent> findByAvailableTrueAndActiveTrue();

    // Find nearest available agents using geo query
    @Query("{ 'available': true, 'active': true, 'location': { $near: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } } }")
    List<DeliveryAgent> findNearestAvailableAgents(
            double longitude, double latitude, double maxDistanceMeters);
}