package com.example.delivery_service.service;

import com.example.delivery_service.document.*;
import com.example.delivery_service.dto.*;
import com.example.delivery_service.kafka.DeliveryEventPublisher;
import com.example.delivery_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryAgentRepository agentRepository;
    private final DeliveryOrderRepository deliveryOrderRepository;
    private final DeliveryEventPublisher eventPublisher;
    private final SimpMessagingTemplate messagingTemplate;

    // Register a new delivery agent
    public DeliveryAgent registerAgent(Long userId,
                                       AgentRegistrationRequest request) {
        DeliveryAgent agent = DeliveryAgent.builder()
                .userId(userId)
                .name(request.name())
                .phone(request.phone())
                .available(true)
                .active(true)
                .location(new double[]{80.9462, 26.8467}) // default Lucknow
                .createdAt(LocalDateTime.now())
                .build();
        return agentRepository.save(agent);
    }

    // Update driver's GPS location
    public void updateLocation(Long userId,
                               LocationUpdateRequest request) {
        DeliveryAgent agent = agentRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Agent not found"));

        // MongoDB stores as [longitude, latitude]
        agent.setLocation(new double[]{
                request.longitude(), request.latitude()});
        agent.setLastLocationUpdate(LocalDateTime.now());
        agentRepository.save(agent);

        // Send real-time update via WebSocket
        if (agent.getCurrentOrderId() != null) {
            Map<String, Object> locationUpdate = Map.of(
                    "latitude", request.latitude(),
                    "longitude", request.longitude(),
                    "timestamp", System.currentTimeMillis()
            );
            // Broadcast to all customers tracking this order
            messagingTemplate.convertAndSend(
                    "/topic/order/" + agent.getCurrentOrderId()
                            + "/location",
                    locationUpdate);
        }
    }

    // Assign nearest available driver
    public void assignDriver(Long orderId, Long customerId) {
        // Find available agents
        List<DeliveryAgent> availableAgents =
                agentRepository.findByAvailableTrueAndActiveTrue();

        if (availableAgents.isEmpty()) {
            log.warn("No available drivers for order: {}", orderId);
            return;
        }

        // Pick first available agent (in production: use geo query)
        DeliveryAgent agent = availableAgents.get(0);
        agent.setAvailable(false);
        agent.setCurrentOrderId(orderId);
        agentRepository.save(agent);

        // Create delivery order
        DeliveryOrder deliveryOrder = DeliveryOrder.builder()
                .orderId(orderId)
                .customerId(customerId)
                .agentId(agent.getId())
                .status("ASSIGNED")
                .locationHistory(new ArrayList<>())
                .currentLocation(agent.getLocation())
                .assignedAt(LocalDateTime.now())
                .build();
        deliveryOrderRepository.save(deliveryOrder);

        // Publish event
        eventPublisher.publishDriverAssigned(
                orderId, agent.getId(), customerId);
        log.info("Driver {} assigned to order {}",
                agent.getId(), orderId);
    }

    // Update delivery status
    public DeliveryOrder updateStatus(Long orderId,
                                      DeliveryStatusRequest request) {
        DeliveryOrder delivery = deliveryOrderRepository
                .findByOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Delivery not found"));

        delivery.setStatus(request.status());

        switch (request.status()) {
            case "PICKED_UP" -> {
                delivery.setPickedUpAt(LocalDateTime.now());
                eventPublisher.publishOrderPickedUp(orderId);
            }
            case "DELIVERED" -> {
                delivery.setDeliveredAt(LocalDateTime.now());
                eventPublisher.publishOrderDelivered(orderId);

                // Free up the agent
                agentRepository.findById(delivery.getAgentId())
                        .ifPresent(agent -> {
                            agent.setAvailable(true);
                            agent.setCurrentOrderId(null);
                            agentRepository.save(agent);
                        });
            }
        }

        return deliveryOrderRepository.save(delivery);
    }

    public DeliveryOrder trackOrder(Long orderId) {
        return deliveryOrderRepository.findByOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Delivery not found"));
    }

    public DeliveryAgent toggleAvailability(Long userId) {
        DeliveryAgent agent = agentRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Agent not found"));
        agent.setAvailable(!agent.isAvailable());
        return agentRepository.save(agent);
    }
}