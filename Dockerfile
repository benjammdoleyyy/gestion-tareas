FROM eclipse-temurin:21-jdk-jammy

WORKDIR /home/app

COPY . /home/app

EXPOSE 3690

CMD ["java", "-jar", "/home/app/app.jar"]
