package com.example.order_service.repository;

import com.example.order_service.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdOrderByPlacedAtDesc(Long customerId);
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByCustomerIdAndStatus(
            Long customerId, Order.OrderStatus status);
}