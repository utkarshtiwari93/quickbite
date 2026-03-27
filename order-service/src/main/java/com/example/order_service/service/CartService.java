package com.example.order_service.service;

import com.example.order_service.dto.CartItemRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final RedisTemplate<String, Object> redisTemplate;

    private String cartKey(Long userId) {
        return "cart:" + userId;
    }

    public void addItem(Long userId, CartItemRequest request) {
        String key = cartKey(userId);
        Map<String, Object> item = new HashMap<>();
        item.put("menuItemId", request.menuItemId());
        item.put("itemName", request.itemName());
        item.put("quantity", request.quantity());
        item.put("unitPrice", request.unitPrice().toString());
        item.put("restaurantId", request.restaurantId());

        // Get existing cart
        List<Map<String, Object>> cart = getCart(userId);

        // Check if item already exists → update quantity
        boolean found = false;
        for (Map<String, Object> existing : cart) {
            if (existing.get("menuItemId").equals(request.menuItemId())) {
                int newQty = (int) existing.get("quantity") + request.quantity();
                existing.put("quantity", newQty);
                found = true;
                break;
            }
        }
        if (!found) cart.add(item);

        // Save back to Redis with 30 min TTL
        redisTemplate.opsForValue().set(key, cart, 30, TimeUnit.MINUTES);
        log.info("Item added to cart for user: {}", userId);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getCart(Long userId) {
        Object cart = redisTemplate.opsForValue().get(cartKey(userId));
        if (cart == null) return new ArrayList<>();
        return (List<Map<String, Object>>) cart;
    }

    public BigDecimal getCartTotal(Long userId) {
        return getCart(userId).stream()
                .map(item -> new BigDecimal(item.get("unitPrice").toString())
                        .multiply(BigDecimal.valueOf(
                                ((Number) item.get("quantity")).longValue())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void clearCart(Long userId) {
        redisTemplate.delete(cartKey(userId));
    }

    public Long getRestaurantIdFromCart(Long userId) {
        List<Map<String, Object>> cart = getCart(userId);
        if (cart.isEmpty()) return null;
        return ((Number) cart.get(0).get("restaurantId")).longValue();
    }
}