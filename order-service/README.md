# 👤 User Service — QuickBite

## 📌 Overview
User Service is the **authentication and identity backbone** of QuickBite.
Every request in the system starts here — registration, login, JWT generation,
and profile management. It is the FIRST service that runs and every other
service depends on it indirectly via JWT tokens.

**Port:** 8081
**Database:** MySQL (users_db)
**Language:** Java 21
**Framework:** Spring Boot 3.2.5

---

## 🏗 Responsibilities
- User registration (Customer, Restaurant Owner, Delivery Partner, Admin)
- Login with JWT access + refresh token generation
- Password hashing with BCrypt (strength 12)
- Token refresh and revocation
- Profile management
- Role-based identity

---

## 🗄 Database Schema

```sql
CREATE TABLE users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone         VARCHAR(15)  NOT NULL UNIQUE,
    password_hash VARCHAR(60)  NOT NULL,       -- BCrypt hash
    full_name     VARCHAR(100) NOT NULL,
    role          VARCHAR(30)  NOT NULL,        -- CUSTOMER/RESTAURANT_OWNER/DELIVERY_PARTNER/ADMIN
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  TIMESTAMP    NOT NULL,
    is_revoked  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 📡 REST API Endpoints

### Register
```
POST /api/v1/auth/register
Content-Type: application/json

Request:
{
    "email": "test@quickbite.com",
    "phone": "9876543210",
    "password": "password123",
    "fullName": "Test User",
    "role": "CUSTOMER"
}

Response (201 Created):
{
    "success": true,
    "data": {
        "accessToken": "eyJhbGci...",
        "refreshToken": "eyJhbGci...",
        "tokenType": "Bearer",
        "userId": 1,
        "role": "CUSTOMER"
    }
}
```

### Login
```
POST /api/v1/auth/login
Content-Type: application/json

Request:
{
    "email": "test@quickbite.com",
    "password": "password123"
}

Response (200 OK):
{
    "success": true,
    "data": {
        "accessToken": "eyJhbGci...",   -- expires in 15 minutes
        "refreshToken": "eyJhbGci...",  -- expires in 7 days
        "tokenType": "Bearer",
        "userId": 1,
        "role": "CUSTOMER"
    }
}
```

### Refresh Token
```
POST /api/v1/auth/refresh?refreshToken=eyJhbGci...

Response (200 OK):
{
    "success": true,
    "data": {
        "accessToken": "eyJhbGci...",  -- new access token
        "refreshToken": "eyJhbGci...", -- new refresh token (rotated)
        "tokenType": "Bearer",
        "userId": 1,
        "role": "CUSTOMER"
    }
}
```

### Get Profile
```
GET /api/v1/users/me
Authorization: Bearer {accessToken}

Response (200 OK):
{
    "success": true,
    "data": {
        "id": 1,
        "email": "test@quickbite.com",
        "phone": "9876543210",
        "fullName": "Test User",
        "role": "CUSTOMER",
        "isActive": true,
        "createdAt": "2026-01-01T10:00:00"
    }
}
```

---

## 🔄 How It Communicates With Other Services

```
User Service
     │
     │ Publishes Kafka Events
     ▼
┌─────────────────────────────────┐
│ Topic: user-events              │
│ Events:                         │
│  - UserRegistered               │
│  - UserUpdated                  │
└──────────────┬──────────────────┘
               │
               ▼
    Notification Service
    (sends welcome email/SMS)

     │
     │ JWT Token (indirect communication)
     ▼
┌─────────────────────────────────┐
│ API Gateway reads JWT           │
│ Extracts userId + role          │
│ Adds X-User-Id header           │
│ Forwards to downstream service  │
└─────────────────────────────────┘
```

### JWT Flow Between Services
```
1. User logs in → User Service generates JWT
2. Client sends JWT in Authorization header
3. API Gateway intercepts EVERY request
4. Gateway validates JWT signature
5. Gateway extracts userId from JWT subject
6. Gateway adds X-User-Id: 1 header
7. Downstream service (Order/Payment etc) reads X-User-Id
8. No service needs to call User Service for validation!
   (Stateless JWT — no DB lookup needed per request)
```

---

## 🔐 Security Deep Dive

### JWT Structure
```
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: {
    "sub": "1",              -- userId
    "role": "CUSTOMER",      -- user role
    "type": "ACCESS",        -- ACCESS or REFRESH
    "iat": 1704067200,       -- issued at
    "exp": 1704068100        -- expires at (15 min)
}
Signature: HMACSHA256(base64(header) + base64(payload), secret)
```

### BCrypt Password Hashing
```java
// Strength 12 means 2^12 = 4096 iterations
// Makes brute force extremely slow
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
String hash = encoder.encode("password123");
// hash = "$2a$12$..." (60 characters)
```

### Refresh Token Rotation
```
Every time refresh token is used:
1. Old refresh token → marked as REVOKED in DB
2. New refresh token → generated and saved
3. New access token → generated
Why? If refresh token is stolen, attacker can only use it once!
Next use will fail because old token is revoked.
```

---

## ⚠️ What Happens When Things Go Wrong

### Problem 1: User tries to login with wrong password
```
Flow:
1. User sends email + wrong password
2. Service finds user by email ✅
3. BCrypt.matches(wrongPassword, hash) → false
4. Throws RuntimeException("Invalid email or password")
5. GlobalExceptionHandler catches it
6. Returns 400 Bad Request: { "success": false, "message": "Invalid email or password" }

Note: We return SAME message for wrong email AND wrong password
Why? Security — don't reveal which one is wrong (prevents email enumeration)
```

### Problem 2: Access token expires
```
Flow:
1. Client sends expired JWT
2. API Gateway tries to validate
3. JJWT throws ExpiredJwtException
4. Gateway returns 401 Unauthorized
5. Client calls POST /api/v1/auth/refresh with refresh token
6. User Service validates refresh token from DB
7. Returns new access + refresh tokens
8. Client retries original request with new token
```

### Problem 3: User Service is DOWN
```
Impact:
- New users CANNOT register ❌
- Existing users CANNOT login ❌
- BUT already logged in users ARE NOT affected! ✅
  (Because JWT validation happens in Gateway, not User Service)

Why JWT is stateless is a HUGE advantage here!
```

### Problem 4: Database connection fails
```
Flow:
1. MySQL is down
2. HikariCP connection pool times out
3. Spring Boot health check fails
4. Eureka marks service as DOWN after missed heartbeats
5. API Gateway stops routing to this instance
6. If multiple instances → other instances handle traffic
```

### Problem 5: Duplicate registration attempt
```
Flow:
1. User tries to register with existing email
2. Service calls userRepository.existsByEmail() → true
3. Throws RuntimeException("Email already registered")
4. Returns 400 Bad Request
Note: MySQL UNIQUE constraint is BACKUP safety net
```

---

## 🏛 Architecture Decisions & Why

### Why JWT and not Sessions?
```
Sessions (Traditional):
- Store session in DB/Redis on every login
- Every request → DB lookup to validate session
- Doesn't scale well with microservices
- Need shared session store across services

JWT (Our approach):
- Token is self-contained — no DB lookup needed
- Any service can validate by checking signature
- Stateless — scales horizontally
- API Gateway validates once, forwards userId to all services

Tradeoff: Can't invalidate JWT before expiry
Solution: Short expiry (15 min) + refresh token in DB
```

### Why BCrypt strength 12?
```
Strength 10 → ~100ms to hash (default)
Strength 12 → ~400ms to hash (our choice)
Strength 14 → ~1600ms to hash (too slow for login)

Attacker with GPU trying 1 billion passwords/second:
With BCrypt strength 12 → ~4096 iterations per attempt
→ Only 244,140 attempts/second
→ 8-character password = trillions of years to crack
```

### Why store Refresh Tokens in DB?
```
If refresh tokens were stateless (like access tokens):
- No way to invalidate them if stolen!
- User can't "logout from all devices"
- Security breach = attacker has 7 days of access

By storing in DB:
- Can revoke specific tokens
- Can revoke ALL tokens for a user (logout all devices)
- Can see active sessions
- Token rotation detects theft (used token = revoked = alert!)
```

### Why Flyway for migrations?
```
Without Flyway:
- ddl-auto: create-drop → loses data on restart!
- ddl-auto: update → can't rollback, no history
- Manual SQL → error prone, no tracking

With Flyway:
- Version controlled schema changes (V1, V2, V3...)
- Runs migrations automatically on startup
- Tracks what's been applied in flyway_schema_history table
- Same migrations run in dev, staging, production
- Can rollback if needed
```

---

## 🎯 Interview Questions & Answers

### 💻 Technical Questions

**Q1: Explain the complete login flow in your User Service.**
```
Answer:
1. Client sends POST /api/v1/auth/login with email + password
2. AuthService.login() is called
3. Find user by email in MySQL → if not found throw exception
4. BCrypt.matches(inputPassword, storedHash) → if false throw exception
5. Check isActive flag → if false throw "Account deactivated"
6. Revoke all existing refresh tokens for this user (clean slate)
7. Generate Access Token (JWT, 15 min expiry) with userId + role
8. Generate Refresh Token (JWT, 7 days expiry)
9. Save refresh token to DB with expiresAt timestamp
10. Return both tokens to client
```

**Q2: How does JWT validation work across microservices?**
```
Answer:
User Service generates JWT with HMAC-SHA256 signature using a shared secret.
API Gateway has the SAME secret configured.
When a request comes in:
1. Gateway extracts token from Authorization: Bearer header
2. Parses and validates signature using HMAC-SHA256
3. Checks expiration (exp claim)
4. Extracts userId (sub claim) and role
5. Adds X-User-Id and X-User-Role headers
6. Forwards request to downstream service
7. Downstream service reads X-User-Id — no DB call needed!

The secret is: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
(256-bit hex string for HS256)
```

**Q3: What is Token Rotation and why do you use it?**
```
Answer:
Token rotation means: every time a refresh token is used, it gets replaced
with a brand new one. The old one is marked as REVOKED.

Why it matters:
Scenario: Attacker steals user's refresh token
Without rotation: Attacker can use it unlimited times for 7 days!
With rotation:
- User uses refresh token → gets new token, old token REVOKED
- Attacker tries to use stolen (now revoked) token → 401 Unauthorized!
- System can detect: "This token was already used, potential theft!"
- Can automatically revoke ALL tokens for this user as safety measure

Implementation:
refreshTokenRepository.revokeAllUserTokens(userId) — revokes all first
Then generate new refresh token and save
```

**Q4: How do you handle concurrent login from multiple devices?**
```
Answer:
Currently our implementation calls revokeAllUserTokens() on each login,
which means only ONE active session at a time.

For multiple devices we would:
1. NOT revoke all tokens on login
2. Allow multiple refresh tokens per user in DB
3. Each device gets its own refresh token
4. "Logout from all devices" → revokeAllUserTokens()
5. "Logout from this device" → revoke only this device's token

For QuickBite we chose single session for simplicity,
but this is easily extensible.
```

**Q5: What happens if someone tampers with the JWT payload?**
```
Answer:
JWT has 3 parts: header.payload.signature
Signature = HMAC-SHA256(header + payload, secret)

If attacker changes payload (e.g., changes role from CUSTOMER to ADMIN):
1. Payload changes → base64 encoding changes
2. But signature was computed with ORIGINAL payload
3. When Gateway validates: recomputes signature with new payload
4. New signature ≠ stored signature
5. JJWT throws SignatureException → 401 Unauthorized

The secret key is never exposed to clients, so they can't regenerate
a valid signature. This makes JWT tamper-proof.
```

**Q6: Why do you use @Transactional in AuthService?**
```
Answer:
In the register() method:
1. Save user to users table
2. Save refresh token to refresh_tokens table

If step 1 succeeds but step 2 fails → orphaned user with no token!
User can't login because no refresh token exists.

@Transactional ensures BOTH operations succeed or BOTH rollback.
It's atomic — all or nothing.

Same in login():
1. Revoke old tokens
2. Save new refresh token
If revoke succeeds but save fails → user is logged out with no new token!
@Transactional prevents this inconsistency.
```

**Q7: How does Eureka service registration work?**
```
Answer:
1. User Service starts up
2. @EnableEurekaClient annotation activates Eureka client
3. Service sends HTTP POST to Eureka Server (port 8761)
   with its metadata: appName=user-service, ipAddr, port=8081, status=UP
4. Eureka stores this in its registry
5. Every 30 seconds, User Service sends heartbeat to Eureka
6. If 3 consecutive heartbeats missed → Eureka marks service DOWN
7. API Gateway queries Eureka to find user-service instances
8. Uses lb://user-service to load balance across instances

This means: Can run multiple User Service instances for high availability!
Gateway automatically discovers and load balances between them.
```

**Q8: Explain the database connection pooling in your service.**
```
Answer:
We use HikariCP (default in Spring Boot) for connection pooling.

Without pooling:
- Every request → open new DB connection → execute → close connection
- Opening connection takes ~50-100ms (TCP handshake, auth)
- Wastes huge amount of time and resources

With HikariCP:
- Pool of pre-opened connections (default: 10)
- Request comes in → grab available connection from pool → execute → return to pool
- Next request immediately gets connection from pool
- Connection opening overhead: ~0ms (already open!)

Config in application.yml:
spring.datasource.hikari.maximum-pool-size: 10
spring.datasource.hikari.minimum-idle: 5
spring.datasource.hikari.connection-timeout: 30000
```

---

### 🌐 Non-Technical Questions

**Q1: Why did you choose microservices over monolith for this project?**
```
Answer:
For a food delivery platform like QuickBite, microservices make sense because:

1. Independent scaling: During lunch/dinner peak hours, only Order and
   Payment services need more resources, not the whole app.

2. Independent deployment: Can deploy a bug fix in User Service without
   touching Restaurant or Order Service.

3. Team ownership: In a real company, different teams own different services.
   Each team works independently without merge conflicts.

4. Technology flexibility: User Service uses MySQL for relational data,
   Delivery Service uses MongoDB for flexible geo data.
   Can choose best tool per service.

5. Fault isolation: If Search Service goes down, users can still
   browse, order, and pay. Only search is affected.

Tradeoff: More complexity in deployment, debugging, and distributed transactions.
We handled distributed transactions with Saga Choreography pattern.
```

**Q2: If you had to add a new feature (e.g., Social Login with Google), how would you do it?**
```
Answer:
1. Add Spring Security OAuth2 dependency to User Service pom.xml
2. Configure Google OAuth2 credentials in application.yml
3. Add new endpoint: GET /api/v1/auth/google/callback
4. In callback: extract email from Google profile
5. Check if user exists in DB by email
   - If exists: generate JWT and return (login flow)
   - If not exists: create user with Google data (register flow)
6. No password needed for social login users
7. Add "loginType" field to users table (EMAIL or GOOGLE)
8. Update API Gateway to handle OAuth2 redirects

Zero changes needed in other microservices!
This is the beauty of microservices — changes are isolated.
```

**Q3: How would you handle a security breach where JWT secret is compromised?**
```
Answer:
If JWT secret is leaked, ALL tokens become forgeable by attackers!

Immediate response:
1. Generate new JWT secret immediately
2. Deploy new secret to all services (Gateway + User Service)
3. All existing tokens become invalid instantly (different secret = invalid signature)
4. All users get logged out — they must login again
5. New tokens are generated with new secret

Better long-term approach (Dual Key Rotation):
1. Support TWO secrets simultaneously (old + new)
2. New logins → use new secret
3. Existing tokens with old secret → still valid for 15 minutes (access token lifetime)
4. After 15 minutes → all old tokens expired naturally
5. Remove old secret support
6. Zero disruption to users!

Prevention: Store secrets in environment variables, never in code or YAML.
Use Kubernetes Secrets or AWS Secrets Manager in production.
```

---

### 🎭 Situation-Based Questions

**Q1: "Your User Service is getting 10,000 login requests per minute. How do you scale?"**
```
Answer:
Step 1: Check if it's a legitimate spike or DDoS
- API Gateway has rate limiting: 100 req/min per IP
- Legitimate users won't hit this limit
- Bot attack → rate limiting blocks most

Step 2: Horizontal Scaling
- JWT validation is stateless → no session sharing needed
- Just run more instances: 2, 3, 5 User Service instances
- Eureka registers all instances automatically
- API Gateway load balances across all instances (Round Robin)

Step 3: Database optimization
- Add read replica for MySQL
- Cache user lookup by email in Redis (TTL: 5 minutes)
- BCrypt is CPU intensive → vertical scale helps too

Step 4: Kubernetes HPA
- HorizontalPodAutoscaler: minReplicas=2, maxReplicas=10
- Scale up when CPU > 70%
- Scale down automatically when load reduces

With JWT being stateless → User Service is naturally horizontally scalable!
```

**Q2: "A user complains they can't login even with correct credentials. How do you debug?"**
```
Answer:
Step 1: Check User Service logs
- Search by email: grep "email@test.com" logs
- Look for exceptions or error messages

Step 2: Check if user exists in DB
SELECT * FROM users WHERE email = 'email@test.com';
- Check is_active flag (could be deactivated)
- Check if email exists at all

Step 3: Check if service is healthy
- GET http://localhost:8081/actuator/health
- Check DB connection, disk space

Step 4: Test the password manually
- BCrypt hash in DB → verify with BCrypt tool
- Password might have special characters causing encoding issues

Step 5: Check JWT secret
- Is secret same in User Service and API Gateway?
- Mismatch → token generated but validation fails

Step 6: Check refresh token table
- Are old tokens being properly revoked?
- DB could be full or locked

Most common root cause: is_active = false OR password encoding issue
```

**Q3: "Your refresh tokens table has 50 million rows and queries are slow. Fix it?"**
```
Answer:
Root cause: No cleanup of expired/revoked tokens!

Immediate fix:
DELETE FROM refresh_tokens 
WHERE is_revoked = TRUE OR expires_at < NOW();
-- Run this immediately to clean old data

Add index:
CREATE INDEX idx_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_token ON refresh_tokens(token);
CREATE INDEX idx_expires ON refresh_tokens(expires_at);

Long term fix — scheduled cleanup job:
@Scheduled(cron = "0 0 2 * * *") // Run at 2 AM daily
public void cleanExpiredTokens() {
    refreshTokenRepository.deleteByExpiresAtBeforeOrIsRevokedTrue(LocalDateTime.now());
}

Also: Archive old tokens instead of deleting
(for audit trail, move to separate archive table)

Partitioning: Partition refresh_tokens table by month
Older partitions can be dropped instantly (ALTER TABLE DROP PARTITION)
```

**Q4: "How would you implement 'Remember Me' feature (30 day login)?"**
```
Answer:
Currently refresh token expires in 7 days.

Implementation:
1. Add "rememberMe" boolean to LoginRequest
2. If rememberMe = true → refresh token TTL = 30 days
   If rememberMe = false → refresh token TTL = 7 days (default)
3. Store TTL in refresh_tokens table

Code change in AuthService:
long ttlDays = request.rememberMe() ? 30 : 7;
RefreshToken refreshToken = RefreshToken.builder()
    .expiresAt(LocalDateTime.now().plusDays(ttlDays))
    .build();

Security consideration:
- Longer TTL = higher risk if token stolen
- Mitigated by token rotation
- Option: require re-authentication for sensitive operations
  (like changing password or payment) regardless of remember me
```

---

## 📊 Key Metrics to Monitor

| Metric | Alert Threshold | Tool |
|--------|----------------|------|
| Login success rate | < 95% → Alert | Prometheus |
| Registration rate | Sudden spike → Investigate | Grafana |
| BCrypt hash time | > 500ms → Alert | Micrometer |
| DB connection pool | > 80% used → Alert | HikariCP metrics |
| JWT validation failures | > 100/min → Alert | Custom counter |
| Refresh token table size | > 1M rows → Cleanup | MySQL |

---

## 🚦 Health Check

```
GET http://localhost:8081/actuator/health

Response:
{
    "status": "UP",
    "components": {
        "db": { "status": "UP" },
        "diskSpace": { "status": "UP" },
        "eureka": { "status": "UP" }
    }
}
```

---

## 📁 Project Structure

```
user-service/
├── src/main/java/com/quickbite/userservice/
│   ├── UserServiceApplication.java
│   ├── controller/
│   │   └── AuthController.java       ← REST endpoints
│   ├── service/
│   │   └── AuthService.java          ← Business logic
│   ├── entity/
│   │   ├── User.java                 ← User JPA entity
│   │   └── RefreshToken.java         ← Token JPA entity
│   ├── repository/
│   │   ├── UserRepository.java       ← DB operations
│   │   └── RefreshTokenRepository.java
│   ├── dto/
│   │   ├── RegisterRequest.java      ← Java 21 Record
│   │   ├── LoginRequest.java         ← Java 21 Record
│   │   └── TokenResponse.java        ← Java 21 Record
│   ├── security/
│   │   ├── JwtService.java           ← JWT generation/validation
│   │   └── SecurityConfig.java       ← Spring Security config
│   └── exception/
│       └── GlobalExceptionHandler.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/
│       └── V1__create_users_table.sql  ← Flyway migration
└── Dockerfile
```

---

## 💡 Java 21 Features Used

```java
// Records for DTOs — immutable, no boilerplate
public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password
) {}

// Virtual Threads — handle more concurrent requests
spring.threads.virtual.enabled: true
// Each request runs on lightweight virtual thread
// Can handle 100,000+ concurrent requests on small hardware!

// Pattern matching (used in switch expressions)
// Sealed classes potential for Role hierarchy
```

---

## 🔗 Dependencies On Other Services

| Depends On | Why | What Happens If Down |
|-----------|-----|---------------------|
| MySQL | Store users and tokens | Service fails to start |
| Eureka Server | Service registration | Service starts but not discoverable |
| Kafka (optional) | Publish user events | Events not published, service still works |

## 🔗 Other Services That Depend On Us

| Service | How | Impact If User Service Down |
|---------|-----|---------------------------|
| API Gateway | JWT validation (indirect) | Gateway still validates existing tokens |
| All Services | X-User-Id header via Gateway | Already logged in users unaffected |
| Notification Service | UserRegistered event | Welcome notification not sent |
```

---

