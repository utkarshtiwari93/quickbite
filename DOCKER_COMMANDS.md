# QuickBite Docker Commands Reference

## 🚀 Quick Commands

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart services
docker-compose restart
```

---

## 📋 Complete Command Reference

### Building Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build api-gateway

# Build without cache
docker-compose build --no-cache

# Build and view progress
docker-compose build --progress=plain

# Build multiple services
docker-compose build api-gateway user-service restaurant-service
```

### Starting Services

```bash
# Start all services (detached - background)
docker-compose up -d

# Start specific service
docker-compose up -d api-gateway

# Start and view logs
docker-compose up

# Start with environment file
docker-compose --env-file .env.production up -d

# Start with multiple compose files
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Viewing Status

```bash
# View running containers
docker-compose ps

# View with extended info
docker-compose ps --no-trunc

# View all containers (including stopped)
docker-compose ps -a
```

### Viewing Logs

```bash
# All services logs
docker-compose logs

# Specific service
docker-compose logs api-gateway

# Follow logs (tail -f)
docker-compose logs -f

# Follow specific service
docker-compose logs -f api-gateway

# Last 100 lines
docker-compose logs --tail=100

# Show timestamps
docker-compose logs --timestamps

# Combine options
docker-compose logs -f --tail=50 --timestamps api-gateway
```

### Stopping Services

```bash
# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop api-gateway

# Stop with timeout (default: 10s)
docker-compose stop -t 30

# Stop and remove containers
docker-compose down

# Stop, remove, and remove volumes
docker-compose down -v

# Stop and remove including images
docker-compose down --rmi all
```

### Restarting Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart api-gateway

# Restart with timeout
docker-compose restart -t 30

# Restart after code change
docker-compose build api-gateway
docker-compose up -d api-gateway
```

### Executing Commands

```bash
# Get container name
docker-compose ps

# Execute command in container
docker-compose exec api-gateway java -version

# Interactive shell
docker-compose exec api-gateway /bin/sh

# View environment variables
docker-compose exec api-gateway env

# Check JAR file
docker-compose exec api-gateway ls -la /app/

# Database operations
docker-compose exec mysql mysql -uroot -pUTKARSH@123 -e "SHOW DATABASES;"

# Check logs from container
docker-compose exec api-gateway cat /proc/1/fd/1

# Redis operations
docker-compose exec redis redis-cli PING

# Kafka operations
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092
```

### Service Information

```bash
# View service configuration
docker-compose config

# View service images
docker-compose images

# View service networks
docker network ls

# View service volumes
docker volume ls

# View build history
docker-compose build --verbose
```

### Monitoring & Debugging

```bash
# View resource usage
docker stats

# View specific container stats
docker stats api-gateway

# Inspect container
docker inspect api-gateway

# Inspect network
docker inspect quickbite-network

# Inspect volume
docker inspect mysql_data

# View container processes
docker top api-gateway

# View container events
docker events

# View network connectivity
docker exec api-gateway ping mysql

# DNS resolution check
docker exec api-gateway nslookup api-gateway
```

### Maintenance

```bash
# Remove stopped containers
docker-compose rm

# Remove images
docker-compose rm -v --force

# Clean unused images
docker image prune

# Clean unused volumes
docker volume prune

# Clean unused networks
docker network prune

# Full cleanup
docker system prune -a

# Show disk usage
docker system df
```

---

## 🔍 Service-Specific Commands

### MySQL Database

```bash
# Connect to MySQL
docker-compose exec mysql mysql -uroot -pUTKARSH@123

# Common SQL commands once connected:
mysql> SHOW DATABASES;
mysql> USE users_db;
mysql> SHOW TABLES;
mysql> SELECT COUNT(*) FROM users;
mysql> EXIT;

# Backup database
docker-compose exec mysql mysqldump -uroot -pUTKARSH@123 users_db > backup.sql

# Restore database
docker-compose exec -T mysql mysql -uroot -pUTKARSH@123 users_db < backup.sql
```

### Redis Cache

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Common Redis commands once connected:
> PING
> KEYS *
> GET key_name
> SET key_name value
> DEL key_name
> FLUSHALL
> EXIT

# Monitor Redis activity
docker-compose exec redis redis-cli MONITOR

# View Redis memory
docker-compose exec redis redis-cli INFO memory
```

### MongoDB

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u root -p root

# Common MongoDB commands once connected:
> show databases
> use delivery_db
> show collections
> db.deliveries.find()
> db.deliveries.count()
> exit

# Backup MongoDB
docker-compose exec mongodb mongodump -u root -p root -d delivery_db -o ./backup

# Restore MongoDB
docker-compose exec -T mongodb mongorestore -u root -p root -d delivery_db ./backup/delivery_db
```

### Kafka Topics

```bash
# List topics
docker-compose exec kafka kafka-topics \
  --list \
  --bootstrap-server localhost:9092

# Create topic
docker-compose exec kafka kafka-topics \
  --create \
  --topic order-events \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 1

# View topic details
docker-compose exec kafka kafka-topics \
  --describe \
  --topic order-events \
  --bootstrap-server localhost:9092

# Consume messages
docker-compose exec kafka kafka-console-consumer \
  --topic order-events \
  --from-beginning \
  --bootstrap-server localhost:9092

# Produce message
docker-compose exec kafka kafka-console-producer \
  --topic order-events \
  --bootstrap-server localhost:9092
```

### Elasticsearch

```bash
# Check cluster health
curl http://localhost:9200/_cluster/health

# List indices
curl http://localhost:9200/_cat/indices

# View index mapping
curl http://localhost:9200/restaurants/_mapping

# Search
curl -X POST http://localhost:9200/restaurants/_search \
  -H 'Content-Type: application/json' \
  -d '{"query": {"match_all": {}}}'
```

### Java Services

```bash
# Check Java version
docker-compose exec api-gateway java -version

# View running threads
docker-compose exec api-gateway jps -l

# Monitor JVM
docker-compose exec api-gateway jstat -gc -h10 1 1000

# View application logs
docker-compose exec api-gateway tail -f /root/.java/.userPrefs/com/example/api_gateway/prefs.xml
```

---

## 🚨 Troubleshooting Commands

### Check Service Status

```bash
# Detailed service info
docker-compose ps --no-trunc

# Service health
curl http://localhost:8080/actuator/health
curl http://localhost:8081/actuator/health
curl http://localhost:8761/actuator/health

# Check if port is accessible
curl -v http://localhost:8080
```

### Network Debugging

```bash
# Check network
docker network inspect quickbite-network

# Ping between services (from one container)
docker-compose exec api-gateway ping user-service

# DNS test
docker-compose exec api-gateway nslookup mysql

# Curl between services
docker-compose exec api-gateway curl http://user-service:8081/actuator/health
```

### Container Debugging

```bash
# View detailed logs
docker-compose logs --timestamps api-gateway

# Follow logs of multiple services
docker-compose logs -f api-gateway user-service

# Search logs
docker-compose logs api-gateway | grep ERROR

# Last 500 lines
docker-compose logs --tail=500 api-gateway
```

### Restart Issues

```bash
# Stop all services
docker-compose down

# Remove all containers, volumes, networks
docker-compose down -v

# Clean up Docker
docker system prune -a

# Rebuild everything
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

---

## 🎯 Common Workflows

### Development: Code Change → Rebuild → Test

```bash
# 1. Code change in src/
# 2. Rebuild affected service
docker-compose build api-gateway

# 3. Restart service
docker-compose up -d api-gateway

# 4. Check logs
docker-compose logs -f api-gateway

# 5. Test endpoint
curl http://localhost:8080/api/v1/health
```

### Debugging: Service Won't Start

```bash
# 1. Check logs
docker-compose logs api-gateway

# 2. Check if port is available
lsof -i :8080  # or netstat on Windows

# 3. Check dependencies
docker-compose ps | grep mysql

# 4. Rebuild clean
docker-compose build --no-cache api-gateway

# 5. Start with logs
docker-compose up api-gateway

# 6. Interactive debug
docker-compose exec api-gateway /bin/sh
```

### Database Issue: Data Lost

```bash
# 1. Check volume exists
docker volume ls

# 2. Inspect volume
docker volume inspect mysql_data

# 3. Check container mount
docker inspect quickbite-mysql | grep -A 5 Mounts

# 4. Restore from backup
docker-compose exec -T mysql mysql -uroot -pUTKARSH@123 users_db < backup.sql

# 5. Verify data
docker-compose exec mysql mysql -uroot -pUTKARSH@123 -e "SELECT COUNT(*) FROM users_db.users;"
```

### Performance Issue: Service Slow

```bash
# 1. Check resource usage
docker stats api-gateway

# 2. View logs for errors
docker-compose logs api-gateway | grep -i error

# 3. Check dependencies
curl http://localhost:6379  # Redis
curl http://localhost:3306  # MySQL

# 4. Monitor in real-time
watch -n 1 'docker stats --no-stream api-gateway'

# 5. Check JVM memory
docker-compose exec api-gateway jps -l -m
```

### Deployment: Push to Production

```bash
# 1. Build final images
docker-compose build

# 2. Tag images with version
docker tag quickbite/api-gateway myregistry.azurecr.io/quickbite/api-gateway:v1.0.0

# 3. Push to registry
docker push myregistry.azurecr.io/quickbite/api-gateway:v1.0.0

# 4. Update docker-compose.yml with new image
# Edit image: myregistry.azurecr.io/quickbite/api-gateway:v1.0.0

# 5. Deploy
docker-compose pull
docker-compose up -d

# 6. Verify
docker-compose ps
curl http://localhost:8080/actuator/health
```

---

## 📊 Useful One-Liners

```bash
# Start all services silently
docker-compose up -d && docker-compose ps

# Stop all and clean
docker-compose down -v && docker system prune -a -f

# View all service IPs
docker inspect -f '{{.Name}} {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q)

# Export running container as image
docker commit quickbite-api-gateway api-gateway-custom:latest

# Export services to image tar
docker save quickbite/api-gateway | gzip > api-gateway.tar.gz

# Check all container health
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -v "healthy"

# Monitor memory in real-time
docker stats --no-stream | sort -k4 -h

# Kill all containers and volumes
docker-compose down -v --remove-orphans

# Enter container shell
docker-compose exec -u root api-gateway /bin/sh
```

---

## ⚙️ Advanced Configuration

### Custom Compose File

```bash
# Use production compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Use development compose file
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Multiple files with overrides
docker-compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  -f docker-compose.secrets.yml \
  up -d
```

### Environment Files

```bash
# Use .env file
docker-compose --env-file .env.prod up -d

# Or create docker-compose.override.yml for local changes
# (automatically loaded if exists)
```

### Service Scaling

```bash
# Run multiple instances (for stateless services)
docker-compose up -d --scale api-gateway=3

# Or use profile-based composition
docker-compose --profile test up -d
```

---

## 🔒 Security Commands

```bash
# Scan images for vulnerabilities
docker scan quickbite/api-gateway

# View image security details
docker inspect quickbite/api-gateway | grep -A 20 SecurityOpt

# Run container with read-only filesystem
docker run --read-only quickbite/api-gateway

# Run with dropped capabilities
docker run --cap-drop=ALL quickbite/api-gateway

# Run as non-root user
docker run --user app quickbite/api-gateway
```

---

**Last Updated**: April 7, 2026
**Status**: ✅ Complete Reference
