FROM eclipse-temurin:17-jdk-alpine AS build

# Set the working directory
WORKDIR /app

# Copy the Maven project files
COPY pom.xml ./
COPY src ./src

# Build the application using Maven
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

# Set the working directory
WORKDIR /app

# Copy the built artifact from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Default command to run the application
CMD ["java", "-jar", "app.jar"]