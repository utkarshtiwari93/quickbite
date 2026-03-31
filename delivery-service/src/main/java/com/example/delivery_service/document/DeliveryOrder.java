package com.example.delivery_service.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "delivery_orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOrder {

    @Id
    private String id;

    private Long orderId;
    private Long customerId;
    private Long restaurantId;
    private String agentId;

    private String status; // ASSIGNED, PICKED_UP, DELIVERED

    // Location history for tracking
    private List<LocationPoint> locationHistory;

    // Current location
    private double[] currentLocation;

    private LocalDateTime assignedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationPoint {
        private double[] coordinates;
        private LocalDateTime timestamp;
    }
}