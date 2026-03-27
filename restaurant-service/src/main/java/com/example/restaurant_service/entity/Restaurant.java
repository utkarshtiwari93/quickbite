package com.example.restaurant_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "restaurants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "cuisine_type")
    private String cuisineType;

    private String address;
    private String city;

    private BigDecimal lat;
    private BigDecimal lng;

    private String phone;
    private String email;

    @Column(name = "is_open")
    private boolean isOpen = false;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "avg_rating")
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Column(name = "delivery_time")
    private Integer deliveryTime = 30;

    @Column(name = "min_order")
    private BigDecimal minOrder = BigDecimal.ZERO;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    private List<MenuCategory> categories;
}