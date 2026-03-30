package com.example.payment_service.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishPaymentCompleted(Long orderId,
                                        Long customerId, BigDecimal amount) {
        Map<String, Object> event = Map.of(
                "type", "PAYMENT_COMPLETED",
                "orderId", orderId,
                "customerId", customerId,
                "amount", amount.toString(),
                "timestamp", System.currentTimeMillis()
        );
        kafkaTemplate.send("payment-events", orderId.toString(), event);
        log.info("Published PAYMENT_COMPLETED for order: {}", orderId);
    }

    public void publishPaymentFailed(Long orderId, String reason) {
        Map<String, Object> event = Map.of(
                "type", "PAYMENT_FAILED",
                "orderId", orderId,
                "reason", reason,
                "timestamp", System.currentTimeMillis()
        );
        kafkaTemplate.send("payment-events", orderId.toString(), event);
        log.info("Published PAYMENT_FAILED for order: {}", orderId);
    }
}