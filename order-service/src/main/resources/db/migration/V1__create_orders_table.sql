CREATE TABLE IF NOT EXISTS orders (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number        VARCHAR(20)     NOT NULL UNIQUE,
    customer_id         BIGINT          NOT NULL,
    restaurant_id       BIGINT          NOT NULL,
    status              ENUM('PENDING','CONFIRMED','PREPARING','READY','PICKED_UP','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    total_amount        DECIMAL(10,2)   NOT NULL,
    delivery_address    VARCHAR(500)    NOT NULL,
    delivery_lat        DECIMAL(9,6),
    delivery_lng        DECIMAL(9,6),
    estimated_time      INT             DEFAULT 30,
    payment_method      VARCHAR(20)     DEFAULT 'ONLINE',
    special_instructions VARCHAR(500),
    placed_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at        TIMESTAMP,
    delivered_at        TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT          NOT NULL,
    menu_item_id    BIGINT          NOT NULL,
    item_name       VARCHAR(255)    NOT NULL,
    quantity        INT             NOT NULL,
    unit_price      DECIMAL(8,2)    NOT NULL,
    total_price     DECIMAL(8,2)    NOT NULL,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id)
);