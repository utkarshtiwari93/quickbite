CREATE TABLE IF NOT EXISTS restaurants (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id        BIGINT          NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    description     VARCHAR(500),
    cuisine_type    VARCHAR(100),
    address         VARCHAR(255),
    city            VARCHAR(100),
    lat             DECIMAL(9,6),
    lng             DECIMAL(9,6),
    phone           VARCHAR(15),
    email           VARCHAR(255),
    is_open         BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    avg_rating      DECIMAL(3,2)    DEFAULT 0.00,
    delivery_time   INT             DEFAULT 30,
    min_order       DECIMAL(8,2)    DEFAULT 0.00,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_categories (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id   BIGINT          NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    display_order   INT             DEFAULT 0,
    CONSTRAINT fk_category_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE IF NOT EXISTS menu_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id     BIGINT          NOT NULL,
    restaurant_id   BIGINT          NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    description     VARCHAR(500),
    price           DECIMAL(8,2)    NOT NULL,
    is_veg          BOOLEAN         NOT NULL DEFAULT TRUE,
    is_available    BOOLEAN         NOT NULL DEFAULT TRUE,
    image_url       VARCHAR(500),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_category FOREIGN KEY (category_id) REFERENCES menu_categories(id),
    CONSTRAINT fk_item_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);