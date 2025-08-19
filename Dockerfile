# Etapa 1: construcción
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /build
COPY . .
RUN ./mvnw clean package -DskipTests

# Etapa 2: ejecución
FROM eclipse-temurin:21-jre-jammy
WORKDIR /home/app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 3690
ENTRYPOINT ["java", "-jar", "app.jar"]
