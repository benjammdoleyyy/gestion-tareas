# 1. Imagen base de Java
FROM openjdk:17-jdk-slim

# 2. Directorio de trabajo
WORKDIR /app

# 3. Copiar el JAR generado
COPY target/springboot-plantilla-0.0.1-SNAPSHOT.jar app.jar

# 4. Puerto que expondrá la app
EXPOSE 8080

# 5. Comando para ejecutar la app
ENTRYPOINT ["java","-jar","app.jar"]