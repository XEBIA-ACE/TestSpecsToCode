# ----------- Builder Stage -----------
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# ----------- Runtime Stage -----------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the executable JAR from builder
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# Use a non-root user for security best practices
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENTRYPOINT ["java","-jar","/app/app.jar"]