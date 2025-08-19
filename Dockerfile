# Fase de construcción
FROM maven:3.8.6-eclipse-temurin-17 as builder

WORKDIR /app
COPY pom.xml .
COPY src src

# Cache de dependencias
RUN mvn dependency:go-offline

# Construcción del proyecto
RUN mvn clean package -DskipTests

# Fase de ejecución
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Puerto para Render
EXPOSE 10000

# Health check para Render
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-10000}/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
