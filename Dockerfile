# Fase de construcción con JDK
FROM maven:3.8.6-eclipse-temurin-17 as builder

# Configuración del directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios para la construcción
COPY pom.xml .
COPY src src

# Descarga las dependencias (se cachean si el pom.xml no cambia)
RUN mvn dependency:go-offline

# Construye el proyecto
RUN mvn clean package -DskipTests

# Fase de ejecución (imagen más ligera con solo JRE)
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copia el JAR construido desde la fase de construcción
COPY --from=builder /app/target/*.jar app.jar

# Puerto que expone la aplicación (ajusta según tu aplicación)
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
