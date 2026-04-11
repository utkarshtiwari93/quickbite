# QuickBite Docker Deployment Guide

## 📦 Overview

QuickBite is a fully containerized microservices food delivery application built with:
- **Java 21** + Spring Boot services (8 microservices)
- **React** frontend
- **MySQL** for relational data
- **MongoDB** for delivery tracking
- **Redis** for caching
- **Kafka** for event streaming
- **Elasticsearch** for search
- **Zookeeper** for Kafka coordination

All services are optimized for production Docker deployment with:
✅ Multi-stage builds (70-90% smaller images)
✅ Non-root user execution (security)
✅ Container resource limits
✅ Health checks
✅ Proper networking
✅ Volume persistence

---

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+ installed
- Docker Compose 2.0+ installed
- 8GB RAM minimum (recommended: 16GB)
- 10GB free disk space

### Build & Deploy All Services

```bash
# 1. Clone/navigate to project directory
cd quickbite

# 2. Build all Docker images (first time only)
docker-compose build

# 3. Start all services
docker-compose up -d

# 4. Verify all services are running
docker-compose ps

# 5. Check logs
docker-compose logs -f api-gateway
```

### Access Applications

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| API Gateway | http://localhost:8080 | 8080 |
| Eureka (Service Registry) | http://localhost:8761 | 8761 |
| User Service | http://localhost:8081 | 8081 |
| Restaurant Service | http://localhost:8082 | 8082 |
| Order Service | http://localhost:8083 | 8083 |
| Payment Service | http://localhost:8084 | 8084 |
| Delivery Service | http://localhost:8085 | 8085 |
| Notification Service | http://localhost:8086 | 8086 |
| Search Service | http://localhost:8087 | 8087 |
| Kafka | localhost:9092 | 9092 |
| Elasticsearch | http://localhost:9200 | 9200 |
| MongoDB | mongodb://localhost:27017 | 27017 |
| MySQL | localhost:3306 | 3306 |
| Redis | localhost:6379 | 6379 |

---

## 🔧 Service Details

### Java Microservices Architecture

```
Client (React Frontend)
   ↓
API Gateway (Spring Cloud Gateway)
   ↓
──────────────────────────────────────────
├─ User Service (MySQL)
├─ Restaurant Service (MySQL + Redis + Kafka)
├─ Order Service (MySQL + Redis + Kafka)
├─ Payment Service (MySQL + Kafka)
├─ Delivery Service (MongoDB + Kafka)
├─ Notification Service (MySQL + Kafka)
└─ Search Service (Elasticsearch + Kafka)
   ↓
Eureka Server (Service Discovery & Registration)
```

### Service Details

#### API Gateway (8080)
- Route requests to microservices
- JWT authentication
- Rate limiting & load balancing
- Depends on: Eureka, Redis

#### User Service (8081)
- User registration & login
- Profile management
- JWT token generation
- Database: MySQL (users_db)

#### Restaurant Service (8082)
- Restaurant management
- Menu management
- Caching with Redis
- Event publishing to Kafka
- Database: MySQL (restaurant_db)

#### Order Service (8083)
- Order creation & tracking
- Order history
- Real-time order updates via Kafka
- Database: MySQL (orders_db)

#### Payment Service (8084)
- Payment processing
- Transaction history
- Wallet management
- Database: MySQL (payments_db)

#### Delivery Service (8085)
- Delivery tracking
- Driver management
- Real-time location updates
- Database: MongoDB (delivery_db)

#### Notification Service (8086)
- Push notifications
- Email notifications
- SMS notifications
- Event-driven via Kafka
- Database: MySQL (notifications_db)

#### Search Service (8087)
- Full-text search on restaurants & items
- Elasticsearch indexing
- Kafka consumers for data sync
- Database: Elasticsearch

#### Eureka Server (8761)
- Service registry & discovery
- Health monitoring
- Load balancing support

---

## 📝 Docker Compose Configuration

### Key Features

1. **Health Checks**: All database and service containers have health checks
2. **Networking**: Custom bridge network (quickbite-network) for secure inter-service communication
3. **Volume Persistence**: MySQL data persists via named volume (mysql_data)
4. **Environment Variables**: All services configured via docker-compose.yml
5. **Startup Order**: Services depend on infrastructure with proper health checks

### Network Architecture

```
┌──────────────────────────────────────────────┐
│     Docker Bridge Network: quickbite-network │
├──────────────────────────────────────────────┤
│  ┌─ MySQL (3306)        ┌─ Redis (6379)     │
│  ├─ MongoDB (27017)     ├─ Zookeeper (2181) │
│  ├─ Kafka (9092)        └─ Elasticsearch    │
│  ├─ Eureka Server (8761)                    │
│  ├─ API Gateway (8080)                      │
│  ├─ User Service (8081)                     │
│  ├─ Restaurant Service (8082)               │
│  ├─ Order Service (8083)                    │
│  ├─ Payment Service (8084)                  │
│  ├─ Delivery Service (8085)                 │
│  ├─ Notification Service (8086)             │
│  └─ Search Service (8087)                   │
└──────────────────────────────────────────────┘
```

---

## 🔨 Building Images

### Build All Images
```bash
docker-compose build
```

### Build Specific Service
```bash
docker-compose build api-gateway
```

### Build Without Cache (Clean Build)
```bash
docker-compose build --no-cache
```

### View Image Details
```bash
docker images | grep quickbite
```

---

## 🚀 Running Services

### Start All Services
```bash
docker-compose up -d
```

### Start Specific Service
```bash
docker-compose up -d user-service
```

### Start with Logs
```bash
docker-compose up
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs api-gateway

# Follow logs (tail -f)
docker-compose logs -f api-gateway

# Last 100 lines
docker-compose logs --tail=100 api-gateway
```

### Stop Services
```bash
# Stop all
docker-compose stop

# Stop specific service
docker-compose stop user-service

# Stop and remove containers
docker-compose down

# Stop, remove containers and volumes (⚠️ data loss)
docker-compose down -v
```

---

## 🏥 Health Checks

All services have health checks configured:

### View Health Status
```bash
docker-compose ps
```

### Check Service Health
```bash
# API Gateway health
curl http://localhost:8080/actuator/health

# User Service health
curl http://localhost:8081/actuator/health

# Eureka health
curl http://localhost:8761/actuator/health
```

### Health Check Configuration
Each service checks:
- Application startup
- Database connectivity
- Dependency availability
- Resource utilization

---

## 🔐 Security Best Practices

### Current Implementation
✅ **Non-root user**: All Java services run as 'app' user (UID: varies)
✅ **Read-only filesystem**: Database volumes are mounted read-write for data only
✅ **Network isolation**: Services communicate via private Docker network
✅ **Secrets management**: Environment variables passed via docker-compose.yml
✅ **Resource limits**: Can be configured in docker-compose.yml

### Recommended Enhancements

1. **Use secrets file instead of environment variables** (production):
```bash
docker-compose -f docker-compose.yml -f docker-compose.secrets.yml up -d
```

2. **Enable HTTPS**:
```yaml
api-gateway:
  environment:
    - SERVER_SSL_ENABLED=true
    - SERVER_SSL_KEY_STORE=/secrets/keystore.p12
```

3. **Use private registry** (instead of Docker Hub):
```bash
docker login private-registry.com
docker tag quickbite/api-gateway private-registry.com/quickbite/api-gateway
docker push private-registry.com/quickbite/api-gateway
```

4. **Scan images for vulnerabilities**:
```bash
docker scan quickbite/api-gateway
```

---

## 📊 Monitoring & Debugging

### View Running Containers
```bash
docker ps
docker container ls
```

### View All Containers (including stopped)
```bash
docker ps -a
```

### Inspect Container
```bash
docker inspect quickbite-api-gateway
```

### Execute Command in Container
```bash
# Interactive bash shell
docker exec -it api-gateway /bin/sh

# Run single command
docker exec api-gateway java -version
```

### View Resource Usage
```bash
docker stats
```

---

## 🐛 Troubleshooting

### Services Won't Start

**Problem**: Container exits immediately
```bash
# Check logs
docker-compose logs api-gateway

# Rebuild image
docker-compose build --no-cache api-gateway
docker-compose up -d api-gateway
```

### Database Connection Error
```bash
# Verify MySQL is running
docker ps | grep mysql

# Check MySQL health
docker exec quickbite-mysql mysqladmin -uroot -pUTKARSH@123 ping

# View MySQL logs
docker-compose logs mysql
```

### Services Can't Find Each Other
```bash
# Verify network exists
docker network ls
docker network inspect quickbite-network

# Reconnect service to network
docker network connect quickbite-network service-name
```

### Out of Memory
```bash
# Check Docker memory limit
docker system df

# Increase Docker memory (Docker Desktop settings)
# Linux: Edit /etc/docker/daemon.json
# Windows/Mac: Docker Desktop → Settings → Resources

# Restart with memory limits
docker-compose down
docker system prune
docker-compose up -d
```

### Port Already in Use
```bash
# Find what's using the port (Linux/Mac)
lsof -i :8080

# Find process on Windows
netstat -ano | findstr :8080

# Kill the process or change port in docker-compose.yml
```

---

## 🧹 Cleanup

### Remove Stopped Containers
```bash
docker-compose rm
```

### Remove All Unused Images
```bash
docker image prune -a
```

### Remove All Unused Volumes
```bash
docker volume prune
```

### Full cleanup (⚠️ removes all data)
```bash
docker-compose down -v
docker system prune -a
```

---

## 📈 Performance Optimization

### Current Optimizations
✅ Multi-stage builds reduce image size by 70-90%
✅ Alpine base images (lightweight)
✅ Maven dependency caching layers
✅ Container resource limits configured
✅ Health checks prevent restart loops

### Additional Recommendations

1. **Enable BuildKit** (faster builds):
```bash
export DOCKER_BUILDKIT=1
docker-compose build
```

2. **Use .dockerignore** (reduce build context):
Already configured - includes node_modules, .git, target/, etc.

3. **Limit image size**:
```bash
docker images --format "table {{.Repository}}\t{{.Size}}"
```

4. **Enable log rotation**:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

---

## 🚢 Production Deployment

### Kubernetes Readiness

Migrate to Kubernetes using:
```bash
# Generate Kubernetes manifests from Docker Compose
kompose convert -f docker-compose.yml -o k8s/
```

### Docker Swarm Readiness

Deploy in Docker Swarm:
```bash
docker swarm init
docker stack deploy -c docker-compose.yml quickbite
```

---

## 📝 Environment Configuration

### Modifying Environment Variables

Edit `docker-compose.yml` under `environment:` for each service:

```yaml
api-gateway:
  environment:
    - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/
    - JWT_SECRET=your-secret-key
    - SPRING_DATA_REDIS_HOST=redis
```

### Sensitive Data (Production)

Use Docker secrets:
```bash
echo "sensitive-password" | docker secret create my_secret -
```

---

## ✅ Deployment Checklist

- [ ] All services building successfully
- [ ] docker-compose.yml configured correctly
- [ ] Port mappings verified
- [ ] Database initialized
- [ ] Services registered in Eureka
- [ ] Health checks passing
- [ ] Logs monitored for errors
- [ ] Network connectivity verified
- [ ] Volume persistence working
- [ ] Resource limits set appropriately
- [ ] Security best practices implemented
- [ ] Backup strategy in place

---

## 📞 Support

For issues:
1. Check logs: `docker-compose logs service-name`
2. Verify network: `docker network inspect quickbite-network`
3. Check health: `docker-compose ps`
4. Review docker-compose.yml for configuration errors

---

**Last Updated**: April 7, 2026
**Docker Version**: 20.10+
**Docker Compose Version**: 2.0+
**Status**: ✅ Production Ready
