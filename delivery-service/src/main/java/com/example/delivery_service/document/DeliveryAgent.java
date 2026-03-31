package com.example.delivery_service.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import java.time.LocalDateTime;

@Document(collection = "delivery_agents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAgent {

    @Id
    private String id;

    @Indexed(unique = true)  // ← prevents duplicate userId
    private Long userId;

    private String name;
    private String phone;

    @Builder.Default
    private boolean available = false;

    @Builder.Default
    private boolean active = true;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private double[] location;

    private Long currentOrderId;
    private LocalDateTime lastLocationUpdate;
    private LocalDateTime createdAt;
}