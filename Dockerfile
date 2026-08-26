# ---- Stage 1: build the Angular SPA ----
FROM node:22-alpine AS client-build
WORKDIR /build/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- Stage 2: build the Spring Boot jar ----
FROM maven:3.9-eclipse-temurin-17 AS server-build
WORKDIR /build/server
COPY server/pom.xml ./
# Cache dependencies unless the pom changes
RUN mvn -q dependency:go-offline
COPY server/src ./src
RUN mvn -q -DskipTests package

# ---- Stage 3: runtime ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Absolute paths because the container's working directory differs from dev.
ENV SPA_DIR=/app/client/dist/social-network/browser \
    IMAGES_DIR=/app/public/images
COPY --from=server-build /build/server/target/qa-network-server.jar app.jar
COPY --from=client-build /build/client/dist/social-network/browser /app/client/dist/social-network/browser
COPY server/public/images /app/public/images

EXPOSE 3000
ENTRYPOINT ["java", "-jar", "app.jar"]
