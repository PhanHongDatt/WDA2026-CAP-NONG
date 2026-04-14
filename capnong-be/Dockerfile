# ============================================
# Cạp Nông - Backend Production Dockerfile
# Multi-stage build: Java 21 + Spring Boot 3
# ============================================

# === Stage 1: Build ===
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /build

# Copy Maven wrapper + pom.xml for dependency caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source and build
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# === Stage 2: Runtime ===
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S capnong && adduser -S capnong -G capnong

COPY --from=builder /build/target/*.jar app.jar
RUN chown capnong:capnong app.jar

USER capnong
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
