package com.example.order_service.kafka;

import com.example.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final OrderService orderService;

    @KafkaListener(topics = "payment-events", groupId = "order-service")
    public void handlePaymentEvent(Map<String, Object> event) {
        String type = (String) event.get("type");
        Long orderId = ((Number) event.get("orderId")).longValue();

        log.info("Received payment event: {} for order: {}", type, orderId);

        switch (type) {
            case "PAYMENT_COMPLETED" ->
                    orderService.confirmOrder(orderId);
            case "PAYMENT_FAILED" ->
                    orderService.cancelOrder(orderId, "Payment failed");
        }
    }
}