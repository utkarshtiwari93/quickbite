# Stage 1 - Build (Use official Maven image)
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy only pom.xml first (for caching dependencies)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src src

# Build jar
RUN mvn clean package -DskipTests -B

# Stage 2 - Run (lightweight image)
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S quickbite && adduser -S app -G quickbite
USER app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", \
            "-XX:+UseContainerSupport", \
            "-XX:MaxRAMPercentage=75", \
            "-jar", "app.jar"]