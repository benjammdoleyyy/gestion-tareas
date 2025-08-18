# Usa una imagen de Java oficial con versión compatible con tu proyecto
FROM eclipse-temurin:17-jdk-jammy as builder

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de construcción (pom.xml, gradle, etc.)
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src

# Ejecuta la construcción (ajusta según tu sistema de construcción)
RUN chmod +x gradlew
RUN ./gradlew bootJar

# Segunda etapa: imagen de producción más ligera
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copia el JAR construido desde la etapa anterior
COPY --from=builder /app/build/libs/*.jar app.jar

# Puerto que expone la aplicación (ajusta al puerto que usa tu Spring Boot)
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
