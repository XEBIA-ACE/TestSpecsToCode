FROM eclipse-temurin:17-jdk-alpine as builder

WORKDIR /app

# Install Maven
RUN apk add --no-cache maven

# Copy project files
COPY pom.xml .
COPY src ./src

# Package the application
RUN mvn clean package -DskipTests

# Use a minimal JRE for the application's runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the packaged jar from the build stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]