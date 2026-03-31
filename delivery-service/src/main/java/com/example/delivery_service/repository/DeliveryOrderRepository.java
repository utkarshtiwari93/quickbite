package com.example.delivery_service.repository;

import com.example.delivery_service.document.DeliveryOrder;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface DeliveryOrderRepository
        extends MongoRepository<DeliveryOrder, String> {
    Optional<DeliveryOrder> findByOrderId(Long orderId);
    List<DeliveryOrder> findByAgentId(String agentId);
    List<DeliveryOrder> findByCustomerId(Long customerId);
}