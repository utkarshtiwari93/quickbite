package com.example.order_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "delivery_address", nullable = false)
    private String deliveryAddress;

    @Column(name = "delivery_lat")
    private BigDecimal deliveryLat;

    @Column(name = "delivery_lng")
    private BigDecimal deliveryLng;

    @Column(name = "estimated_time")
    private Integer estimatedTime = 30;

    @Column(name = "payment_method")
    private String paymentMethod = "ONLINE";

    @Column(name = "special_instructions")
    private String specialInstructions;

    @CreationTimestamp
    @Column(name = "placed_at")
    private LocalDateTime placedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @OneToMany(mappedBy = "order",
            cascade = CascadeType.ALL,
            fetch = FetchType.EAGER)
    private List<OrderItem> items;

    public enum OrderStatus {
        PENDING, CONFIRMED, PREPARING,
        READY, PICKED_UP, DELIVERED, CANCELLED
    }
}