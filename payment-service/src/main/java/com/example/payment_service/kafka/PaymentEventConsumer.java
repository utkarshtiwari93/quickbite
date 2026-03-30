package com.example.payment_service.kafka;

import com.example.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventConsumer {

    private final PaymentService paymentService;

    @KafkaListener(topics = "order-events", groupId = "payment-service")
    public void handleOrderEvent(Map<String, Object> event) {
        String type = (String) event.get("type");
        log.info("Received order event: {}", type);

        switch (type) {
            case "ORDER_CREATED" -> {
                Long orderId = ((Number) event.get("orderId")).longValue();
                Long customerId = ((Number) event.get("customerId")).longValue();
                BigDecimal amount = new BigDecimal(
                        event.get("amount").toString());
                paymentService.processPayment(orderId, customerId, amount);
            }
            case "ORDER_CANCELLED" -> {
                Long orderId = ((Number) event.get("orderId")).longValue();
                paymentService.processRefund(orderId);
            }
        }
    }
}