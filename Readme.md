# 🍔 QuickBite — Food Delivery Microservices Platform

A **production-grade food delivery backend system** built using **Java, Spring Boot, and Microservices architecture**.
Inspired by real-world platforms like Swiggy & Zomato, this project demonstrates **scalable system design, distributed communication, and modern DevOps practices**.

---

## 🚀 Features

* 🔐 JWT Authentication (Access + Refresh Tokens)
* 👤 User Management (Register, Login, Profile)
* 🏪 Restaurant Management (CRUD + Open/Close Toggle)
* 🍕 Menu Management (Categories & Items)
* 🛒 Order System (Planned with Saga Pattern)
* 💳 Payment Service (Design Ready)
* 🚚 Delivery Tracking (Planned)
* 🔔 Notification Service (Planned)
* 🔍 Search Service (Planned)
* ⚡ Redis Caching (Menu Optimization)

---

## 🏗️ Microservices Architecture

This project follows a **distributed microservices architecture**:

### Core Services:

* **User Service** → Authentication & User Management (Port: 8081)
* **Restaurant Service** → Restaurant & Menu APIs (Port: 8082)
* **API Gateway** → Routing & Security
* **Eureka Server** → Service Discovery

Each service:

* Runs independently
* Has its own database
* Communicates via REST APIs (Kafka planned for async)

---

## 🧠 Key Concepts Implemented

* API Gateway Pattern
* Service Discovery (Eureka)
* JWT-based Authentication
* Role-Based Access Control (RBAC)
* RESTful API Design
* Layered Architecture (Controller → Service → Repository)

---

## 🛠️ Tech Stack

### Backend

* Java 17
* Spring Boot 3.x
* Spring Security (JWT)
* Spring Data JPA
* Spring Cloud (Gateway, Eureka)

### Database

* PostgreSQL

### Tools & DevOps

* Git & GitHub
* Postman (API Testing)
* Maven
* Lombok

---

## 📦 API Endpoints (Sample)

### 🔐 Auth APIs

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
```

### 🏪 Restaurant APIs

```
POST   /api/v1/restaurants
GET    /api/v1/restaurants/{id}
GET    /api/v1/restaurants
PATCH  /api/v1/restaurants/{id}/status
```

### 🍽️ Menu APIs

```
POST /api/v1/restaurants/{id}/categories
POST /api/v1/restaurants/{id}/categories/{id}/items
GET  /api/v1/restaurants/{id}/menu
```

---

## ▶️ How to Run Locally

### 1. Clone Repository

```bash
git clone https://github.com/your-username/quickbite-microservices.git
cd quickbite-microservices
```

### 2. Start Services (Order matters ⚠️)

1. Start Eureka Server
2. Start User Service
3. Start Restaurant Service
4. Start API Gateway

---

### 3. Test APIs (Postman)

#### Login

```
POST http://localhost:8081/api/v1/auth/login
```

#### Create Restaurant

```
POST http://localhost:8082/api/v1/restaurants
```

#### Get Menu

```
GET http://localhost:8082/api/v1/restaurants/{id}/menu
```

---

## 🔐 Authentication Flow

1. User logs in → gets JWT token
2. Token sent in headers:

```
Authorization: Bearer <token>
```

3. API Gateway validates token
4. User ID extracted and passed to services

---

## 📊 Future Enhancements

* Kafka-based Event Driven Architecture
* Saga Pattern for Order Management
* Docker & Kubernetes Deployment
* Redis Caching Layer
* Elasticsearch for Search
* CI/CD with GitHub Actions
* Payment Gateway Integration

---

## 💼 Resume Highlights

* Built scalable microservices backend using Spring Boot & Spring Cloud
* Implemented JWT authentication and secure API gateway routing
* Designed RESTful APIs for restaurant & menu management
* Followed clean architecture and modular design principles
* Hands-on experience with real-world backend system design

---

## 👨‍💻 Author

**Utkarsh Tiwari**
Aspiring Java Full Stack Developer 🚀

---

## ⭐ Support

If you like this project:

* ⭐ Star this repository
* 🍴 Fork and improve
* 📢 Share with others

---
