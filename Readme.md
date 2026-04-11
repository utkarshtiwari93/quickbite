# 🍔 QuickBite — Food Delivery Microservices Platform

<div align="center">

![QuickBite Banner](https://img.shields.io/badge/QuickBite-Food%20Delivery%20Platform-FF6B35?style=for-the-badge&logo=java)

[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=java)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-3.6-black?style=flat-square&logo=apachekafka)](https://kafka.apache.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.2-red?style=flat-square&logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-25.x-blue?style=flat-square&logo=docker)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)

**A production-grade food delivery platform built with microservices architecture**

[Features](#-features) • [Architecture](#-architecture) • [Services](#-microservices) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Docs](#-api-documentation)

</div>

---

## 📌 Project Overview

QuickBite is a **production-grade food delivery platform** inspired by Swiggy and Zomato, built entirely on microservices architecture using Java 21 and Spring Boot 3.x.

It demonstrates real-world engineering patterns including:
- **Saga Choreography** for distributed transactions
- **Event-driven communication** via Apache Kafka
- **Real-time tracking** with WebSockets
- **Full-text search** with Elasticsearch
- **Role-based access control** with JWT

> 🎯 Built for Java developers (1-3 years experience) targeting top-tier interviews

---

## ✨ Features

### 👤 Customer
- Browse and search restaurants by name, cuisine, city
- View menus with categories and items
- Add to cart and place orders
- Wallet system for payments
- Real-time order tracking with driver location
- Order history and status updates
- Push notifications for every order event

### 🏪 Restaurant Owner
- Create and manage restaurant profile
- Toggle restaurant open/closed status
- Full menu management (categories + items)
- View and manage incoming orders
- Update order status (Confirmed → Preparing → Ready)

### 🚗 Delivery Partner
- Register as delivery agent
- Toggle availability status
- Auto-assignment via nearest driver algorithm
- Real-time GPS location updates
- Mark orders as Picked Up / Delivered

### 💳 Payment
- Wallet top-up and balance management
- Automatic payment on order placement
- Idempotency keys (prevent duplicate charges)
- Automatic refund on cancellation
- Complete transaction history

---

## 🏗 Architecture
                    ┌─────────────────┐
                    │   React Frontend │
                    │  (Vite + Redux)  │
                    └────────┬────────┘
                             │ HTTP
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │ (Port 8080)     │
                    │ JWT Auth Filter │
                    │ Rate Limiting   │
                    └────────┬────────┘
                             │
      ┌──────────────────────┼──────────────────────┐
      │                      │                       │
┌──────▼──────┐      ┌───────▼──────┐      ┌────────▼──────┐
│User Service │      │  Restaurant  │      │ Order Service  │
│ Port: 8081  │      │  Service     │      │  Port: 8083   │
│ MySQL       │      │  Port: 8082  │      │  MySQL+Redis  │
└─────────────┘      │  MySQL+Redis │      └────────┬──────┘
└─────────────┘               │
│ Kafka
┌──────────────────────────────────────────────────────┐
│                  Apache Kafka                         │
│         order-events | payment-events                 │
│         delivery-events | restaurant-events           │
└──────┬─────────────────┬──────────────────┬──────────┘
│                 │                  │
┌─────────────▼──┐  ┌───────────▼────┐  ┌────────▼──────────┐
│Payment Service │  │Delivery Service│  │Notification Svc   │
│ Port: 8084     │  │ Port: 8085     │  │ Port: 8086        │
│ MySQL          │  │ MongoDB        │  │ MySQL             │
└────────────────┘  │ WebSocket      │  └───────────────────┘
└────────────────┘
┌──────────────────┐
│  Search Service  │
│  Port: 8087      │
│  Elasticsearch   │
└──────────────────┘

---

## 🔄 Event Flow — Order Placement (Saga Pattern)
Customer places order
│
▼
Order Service → saves order (PENDING)
│
│ publishes order.created
▼
Payment Service → deducts wallet balance
│
├─── SUCCESS → publishes payment.completed
│                    │
│                    ▼
│             Order Service → status = CONFIRMED
│                    │
│                    │ publishes order.confirmed
│                    ▼
│             Delivery Service → assigns nearest driver
│                    │
│                    │ publishes driver.assigned
│                    ▼
│             Notification Service → push notification
│
└─── FAILED → publishes payment.failed
│
▼
Order Service → status = CANCELLED

---

## 🔧 Microservices

| Service | Port | Database | Responsibilities |
|---------|------|----------|-----------------|
| Eureka Server | 8761 | — | Service discovery and registration |
| API Gateway | 8080 | Redis | JWT validation, routing, rate limiting |
| User Service | 8081 | MySQL | Auth, JWT, user profiles |
| Restaurant Service | 8082 | MySQL + Redis | Restaurant CRUD, menu management |
| Order Service | 8083 | MySQL + Redis | Cart, order lifecycle, Saga |
| Payment Service | 8084 | MySQL | Wallet, payments, refunds |
| Delivery Service | 8085 | MongoDB | Driver tracking, WebSocket |
| Notification Service | 8086 | MySQL | Push, SMS, email notifications |
| Search Service | 8087 | Elasticsearch | Full-text + geo search |

---

## 💻 Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 21 (LTS) | Primary language — Virtual Threads |
| Spring Boot | 3.2.5 | Microservice framework |
| Spring Cloud Gateway | 2023.x | API Gateway with JWT filter |
| Spring Cloud Eureka | 2023.x | Service discovery |
| Apache Kafka | 3.6 | Event bus, async communication |
| Spring Security | 6.x | JWT, BCrypt, RBAC |
| Spring Data JPA | 3.x | ORM for MySQL |
| Spring Data MongoDB | 4.x | Delivery tracking |
| Spring Data Redis | 3.x | Caching, cart, sessions |
| Spring Data Elasticsearch | 8.x | Full-text search |
| Spring WebSocket | 3.x | Real-time location tracking |
| Flyway | 9.x | Database migrations |
| Lombok | 1.18.32 | Boilerplate reduction |
| JJWT | 0.12.3 | JWT generation and validation |

### Databases
| Database | Version | Used By |
|---------|---------|---------|
| MySQL | 8.0 | User, Restaurant, Order, Payment, Notification |
| MongoDB | 7.0 | Delivery Service (geo tracking) |
| Redis | 7.2 | Cart, menu cache, rate limiting |
| Elasticsearch | 8.12 | Search Service |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Redux Toolkit | State management |
| React Router v6 | Client-side routing |
| Axios | HTTP client with JWT interceptor |

### DevOps
| Technology | Purpose |
|-----------|---------|
| Docker | Containerization |
| Docker Compose | Local orchestration |
| GitHub Actions | CI/CD pipeline |

---

## 🚀 Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- Docker Desktop
- MySQL 8.0 (local)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/quickbite.git
cd quickbite
```

### 2. Start Infrastructure
```bash
# Start all Docker services
docker start quickbite-redis quickbite-zookeeper quickbite-kafka quickbite-mongodb quickbite-elasticsearch

# Start MySQL
net start mysql80
```

### 3. Start Backend Services (in order)
```bash
# Start each service in IntelliJ or via Maven
# 1. eureka-server    → port 8761
# 2. api-gateway      → port 8080
# 3. user-service     → port 8081
# 4. restaurant-service → port 8082
# 5. order-service    → port 8083
# 6. payment-service  → port 8084
# 7. delivery-service → port 8085
# 8. notification-service → port 8086
# 9. search-service   → port 8087
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Open Application
http://localhost:5173

### 6. Test Accounts
Customer:  test@quickbite.com / password123
Owner:     owner@quickbite.com / password123
Driver:    driver@quickbite.com / password123

---

## 📡 API Documentation

### Authentication
POST /api/v1/auth/register   → Register new user
POST /api/v1/auth/login      → Login, get JWT tokens
POST /api/v1/auth/refresh    → Refresh access token

### Restaurants
GET  /api/v1/restaurants              → List all restaurants
GET  /api/v1/restaurants/{id}         → Restaurant details
GET  /api/v1/restaurants/{id}/menu    → Full menu
POST /api/v1/restaurants              → Create restaurant
PATCH /api/v1/restaurants/{id}/status → Toggle open/closed

### Orders
POST /api/v1/cart/items    → Add to cart
GET  /api/v1/cart          → View cart
POST /api/v1/orders        → Place order
GET  /api/v1/orders        → Order history
GET  /api/v1/orders/{id}   → Order status
PUT  /api/v1/orders/{id}/cancel → Cancel order

### Payments
GET  /api/v1/wallet/balance  → Wallet balance
POST /api/v1/wallet/topup    → Top up wallet
GET  /api/v1/payments/{orderId} → Payment status

### Delivery
POST  /api/v1/delivery/agent/register     → Register as driver
PATCH /api/v1/delivery/agent/availability → Toggle availability
POST  /api/v1/delivery/agent/location     → Update GPS location
GET   /api/v1/delivery/{orderId}/track    → Track order
PATCH /api/v1/delivery/{orderId}/status   → Update status

### Search
GET /api/v1/search/restaurants?q={query}       → Full-text search
GET /api/v1/search/restaurants?city={city}     → Search by city
GET /api/v1/search/restaurants?cuisine={type}  → Filter by cuisine
GET /api/v1/search/trending                    → Trending restaurants

---

## 🏆 Key Design Patterns

| Pattern | Implementation |
|---------|---------------|
| **Saga Choreography** | Distributed transactions via Kafka events |
| **Database per Service** | Each service has its own isolated database |
| **API Gateway** | Single entry point with JWT validation |
| **Outbox Pattern** | Reliable event publishing with DB + Kafka |
| **Circuit Breaker** | Resilience4j for fault tolerance |
| **CQRS** | Separate read/write via Search Service |
| **Event Sourcing** | Order state changes via Kafka events |

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time | < 200ms (95th percentile) |
| Concurrent Orders | 10,000+ |
| Availability | 99.9% uptime per service |
| Search Latency | < 100ms |
| Location Update | Every 3 seconds |

---

## 🎯 Interview Talking Points

**Q: How do you handle distributed transactions?**
> We use Saga Choreography pattern via Kafka. Each service publishes events and reacts to others. On failure, compensating transactions automatically rollback previous steps.

**Q: How does real-time tracking work?**
> Driver app sends GPS coordinates every 3 seconds via REST API. The backend uses Spring WebSocket + STOMP to broadcast location to the customer's browser in real-time, stored in MongoDB.

**Q: How do you prevent duplicate payments?**
> Every payment has a unique idempotency key (order-{orderId}). Before processing, we check if this key exists. If yes, we return the existing result without charging again.

**Q: How does service discovery work?**
> All services register with Eureka Server on startup. API Gateway uses Eureka to dynamically discover service instances and load balance requests using `lb://service-name`.

**Q: How do you scale for peak hours?**
> Each service is independently deployable. Order and Payment services have Horizontal Pod Autoscalers in Kubernetes (2-10 replicas based on CPU). Kafka buffers events so consumers process at their own pace.

---

## 👨‍💻 Author

**Utkarsh Tiwari**
- GitHub: [@utkarshtiwari93](https://github.com/utkarshtiwari93)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

⭐ **Star this repo if you found it helpful!** ⭐

Built with ❤️ using Java 21 + Spring Boot + Apache Kafka

</div>