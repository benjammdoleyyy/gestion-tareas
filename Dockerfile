# Etapa 1: Construcción con Maven + JDK 21
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Copia pom.xml primero para cachear dependencias
COPY pom.xml ./
RUN mvn dependency:go-offline

# Copia todo el código fuente
COPY src ./src

# Compila el proyecto sin ejecutar tests
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución con JRE 21
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copia el JAR compilado desde la etapa builder
COPY --from=builder /app/target/*.jar app.jar

# Puerto estándar para aplicaciones Spring Boot
EXPOSE 8080

# Comando de ejecución
ENTRYPOINT ["java", "-jar", "app.jar"]
