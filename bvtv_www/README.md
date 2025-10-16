# BVTV WWW Project

Hướng dẫn cài đặt và chạy dự án Spring Boot với Supabase.

## Yêu cầu hệ thống

- Java 21
- Maven 3.x
- VSCode

## 1. Cài đặt Extension cho VSCode

Cài đặt các extension sau trong VSCode:

1. **Extension Pack for Java** (Microsoft)
   - Bao gồm: Language Support for Java, Debugger for Java, Test Runner for Java, Maven for Java, Project Manager for Java

2. **Spring Boot Extension Pack** (VMware)
   - Bao gồm: Spring Boot Tools, Spring Initializr Java Support, Spring Boot Dashboard


## 2. Kết nối Supabase

### Thông tin kết nối

Database đã được cấu hình trong file `pom.xml`:

```
URL: jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
User: postgres.kslvftketzqwjeakyuua
Password: Huy0522714563
```

### Cấu hình trong application.properties

Tạo file `src/main/resources/application.properties` với nội dung:

```properties
spring.datasource.url=jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
spring.datasource.username=postgres.kslvftketzqwjeakyuua
spring.datasource.password=Huy0522714563
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Flyway
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
```

## 3. Câu lệnh chạy dự án

### Chạy Flyway Migration (Migrate database)


Trên Windows (PowerShell) - khi chỉ muốn run sql chứ không run springboot:
```bash
./mvnw flyway:migrate
```


### Chạy Spring Boot Application



Trên Windows (PowerShell) - lệnh này khi chạy đã bao gồm ./mvnw flyway:migrate:
```bash
./mvnw spring-boot:run
```






## 4. Kiểm tra

Sau khi chạy thành công, ứng dụng sẽ chạy tại:
```
http://localhost:8080
```

## 5. Cấu trúc thư mục Migration

Các file migration SQL được đặt tại:
```
src/main/resources/db/migration/
```

Đặt tên file theo format: `V{version}__{description}.sql`

Ví dụ:
- `V1__Create_users_table.sql`
- `V2__Add_roles_table.sql`

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra kết nối internet
- Xác nhận thông tin credentials trong `application.properties`

### Lỗi Java version
- Đảm bảo đã cài Java 21
- Kiểm tra: `java -version`

### Lỗi Maven
- Chạy: `mvnw.cmd clean install` để download dependencies