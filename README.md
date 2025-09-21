# 🗂️ Sistema de Gestión de Tareas

Sistema web desarrollado con **Spring Boot 3.5.4** para la gestión de tareas con soporte para MySQL y PostgreSQL.

## 🛠️ Tecnologías

- **Java 17** + **Spring Boot 3.5.4**
- **Spring Data JPA** - Persistencia de datos
- **MySQL / PostgreSQL** - Base de datos
- **Maven** - Gestión de dependencias
- **Lombok** - Reducción de código
- **Docker** - Containerización

## 📋 Requisitos

- Java 17+
- Maven 3.6+
- MySQL 8.0+ o PostgreSQL 12+

## 🗄️ Configuración de Base de Datos Local

### Opción 1: MySQL

**1. Instalar y configurar MySQL:**
```sql
-- Crear base de datos
CREATE DATABASE gestion_tareas;

-- Crear usuario
CREATE USER 'gestion_user'@'localhost' IDENTIFIED BY 'gestion123';
GRANT ALL PRIVILEGES ON gestion_tareas.* TO 'gestion_user'@'localhost';
FLUSH PRIVILEGES;
```

**2. Configurar application-local.properties:**
```properties name=src/main/resources/application-local.properties
spring.application.name=gestion-tareas
server.port=8080

# MySQL Local
spring.datasource.url=jdbc:mysql://localhost:3306/gestion_tareas
spring.datasource.username=gestion_user
spring.datasource.password=gestion123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
```

### Opción 2: PostgreSQL

**1. Instalar y configurar PostgreSQL:**
```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# En PostgreSQL:
CREATE DATABASE gestion_tareas;
CREATE USER gestion_user WITH PASSWORD 'gestion123';
GRANT ALL PRIVILEGES ON DATABASE gestion_tareas TO gestion_user;
```

**2. Configurar application-local.properties:**
```properties name=src/main/resources/application-local.properties
spring.application.name=gestion-tareas
server.port=8080

# PostgreSQL Local
spring.datasource.url=jdbc:postgresql://localhost:5432/gestion_tareas
spring.datasource.username=gestion_user
spring.datasource.password=gestion123
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```


## 🚀 Ejecutar la Aplicación

```bash
# Clonar proyecto
git clone https://github.com/neisserdev/gestion-tareas.git
cd gestion-tareas

# Ejecutar con perfil local
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# O en Windows
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

## 📝 Notas

- Las tablas se crean automáticamente con `hibernate.ddl-auto=update`
- Usa el perfil `local` para desarrollo
- El perfil por defecto usa la configuración de producción (Render)

## 👨‍💻 Autor

**Neisser Torres Peña** - [@neisserdev](https://github.com/neisserdev)