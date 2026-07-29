FROM eclipse-temurin:21-jre-alpine AS build

# Set a consistent environment variable for JAVA_HOME
ENV JAVA_HOME=/opt/java/openjdk

# Set the working directory
WORKDIR /app

# Copy the project files
COPY . .

# Use Maven to build the application
RUN ./mvnw clean package -DskipTests

# Provide a stage for running the application
FROM eclipse-temurin:21-jre-alpine AS run

WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Execute the application
CMD ["java", "-jar", "app.jar"]