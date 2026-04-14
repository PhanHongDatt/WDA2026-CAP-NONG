# ============================================
# Cạp Nông - Backend Production Dockerfile
# Multi-stage build: Java 21 + Spring Boot 3
# ============================================

# === Stage 1: Build ===
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /build

# Install Maven 3.9.9
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends wget && \
    wget -q https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.tar.gz -O /tmp/maven.tar.gz && \
    tar -xzf /tmp/maven.tar.gz -C /opt && \
    ln -s /opt/apache-maven-3.9.9/bin/mvn /usr/local/bin/mvn && \
    rm /tmp/maven.tar.gz && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy pom.xml first for dependency caching
COPY pom.xml ./
RUN mvn dependency:go-offline -B -q

# Copy source and build
COPY src/ src/
RUN mvn clean package -Dmaven.test.skip=true -B -q

# === Stage 2: Runtime ===
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S capnong && adduser -S capnong -G capnong

COPY --from=builder /build/target/*.jar app.jar
RUN mkdir -p /app/logs && chown -R capnong:capnong /app

USER capnong
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
