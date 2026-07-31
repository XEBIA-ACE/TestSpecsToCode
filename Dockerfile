# ---- Build Stage ----
FROM maven:3.9.7-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven wrapper files if present to leverage wrapper caching
COPY mvnw* ./
COPY .mvn .mvn
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src src

RUN mvn clean package -DskipTests

# ---- Runtime Stage ----
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the Spring Boot executable jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose default Spring Boot port
EXPOSE 8080

ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]