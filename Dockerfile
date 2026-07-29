# Use a specific Java runtime version for the application
FROM eclipse-temurin:11-jre as base

# Stage 1: Build
FROM maven:3.8.6-openjdk-11 AS build
WORKDIR /app

# Copy only the necessary files for Maven build
COPY pom.xml ./
COPY src ./src

# Build application in Maven
RUN mvn clean package -DskipTests

# Stage 2: Package the application
FROM base

WORKDIR /app

# Copy generated artifact from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Execute the application
ENTRYPOINT ["java","-jar","app.jar"]