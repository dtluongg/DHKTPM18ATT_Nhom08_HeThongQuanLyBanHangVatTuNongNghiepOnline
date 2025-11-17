# 📋 Tổng Hợp Lỗi Thường Gặp và Cách Khắc Phục

> **Mục đích**: Ghi chép lại các lỗi đã mắc phải trong quá trình phát triển dự án BVTV WWW và cách giải quyết để tránh lặp lại trong tương lai.

---

## 📑 Mục Lục

1. [Lỗi Authentication & Security](#1-lỗi-authentication--security)
2. [Lỗi Database & Migration](#2-lỗi-database--migration)
3. [Lỗi Backend - Spring Boot](#3-lỗi-backend---spring-boot)
4. [Lỗi Frontend - Next.js](#4-lỗi-frontend---nextjs)
5. [Lỗi API Integration](#5-lỗi-api-integration)
6. [Best Practices](#6-best-practices)

---

## 1. Lỗi Authentication & Security

### ❌ Lỗi 1.1: Login trả về 403 Forbidden hoặc 400 Bad Request

**Nguyên nhân:**

-   Frontend gọi API login 2 lần: 1 lần qua `api.post()` và 1 lần qua `store.login()`
-   Duplicate request gây conflict session

**Triệu chứng:**

```javascript
// ❌ SAI - Gọi API 2 lần
const response = await api.post("/auth/login", credentials);
await login(credentials); // Gọi lại lần 2
```

**Cách fix:**

```javascript
// ✅ ĐÚNG - Chỉ gọi 1 lần
await store.login(credentials);
```

**Bài học:**

-   Kiểm tra kỹ flow authentication, tránh duplicate API calls
-   Sử dụng state management (Zustand) để centralize auth logic

---

### ❌ Lỗi 1.2: Spring Security không nhận diện roles

**Nguyên nhân:**

-   Không implement `UserDetailsService` đúng chuẩn Spring Security
-   Role không có prefix `ROLE_`

**Triệu chứng:**

```java
// ❌ SAI - Return role trực tiếp
return new SimpleGrantedAuthority(profile.getRole().name());
// Kết quả: "ADMIN" (thiếu prefix)
```

**Cách fix:**

```java
// ✅ ĐÚNG - Thêm prefix ROLE_
@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String email) {
        Profile profile = profileRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return User.builder()
            .username(profile.getEmail())
            .password(profile.getPasswordHash())
            .authorities("ROLE_" + profile.getRole().name()) // ← Thêm ROLE_ prefix
            .build();
    }
}
```

**Cấu hình SecurityConfig:**

```java
@Bean
public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();
}

@Bean
public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(customUserDetailsService); // ← Inject CustomUserDetailsService
    provider.setPasswordEncoder(passwordEncoder());
    return provider;
}
```

**Bài học:**

-   Spring Security yêu cầu prefix `ROLE_` cho authorities
-   Phải implement `UserDetailsService` và config `DaoAuthenticationProvider`

---

### ❌ Lỗi 1.3: CORS bị block

**Nguyên nhân:**

-   SecurityConfig có `cors().disable()`

**Triệu chứng:**

```
Access to XMLHttpRequest at 'http://localhost:8080/api/...' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Cách fix:**

```java
// ❌ SAI
http.cors().disable()

// ✅ ĐÚNG
http.cors(cors -> {}) // Enable CORS với cấu hình mặc định từ CorsConfig
```

**CorsConfig.java:**

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // ← Quan trọng cho session cookies

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

**Bài học:**

-   Luôn enable CORS khi frontend và backend chạy khác port
-   Nhớ set `allowCredentials(true)` cho session-based auth

---

### ❌ Lỗi 1.4: Login thành công nhưng session không lưu

**Nguyên nhân:**

-   Không gọi `authenticationManager.authenticate()` và save SecurityContext

**Triệu chứng:**

-   Login trả về user data nhưng subsequent requests không authenticated

**Cách fix:**

```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
    try {
        // ✅ BƯỚC 1: Authenticate qua Spring Security
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );

        // ✅ BƯỚC 2: Lưu authentication vào SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // ✅ BƯỚC 3: Lưu SecurityContext vào HttpSession
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(
            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
            SecurityContextHolder.getContext()
        );

        // Return user data
        Profile profile = profileRepository.findByEmail(request.getEmail()).orElseThrow();
        return ResponseEntity.ok(new ProfileDTO(profile));

    } catch (BadCredentialsException e) {
        return ResponseEntity.status(401).body("Invalid credentials");
    }
}
```

**Bài học:**

-   Session-based auth cần 3 bước: authenticate → set SecurityContext → save to session
-   Không được tự verify password và return user, phải dùng `AuthenticationManager`

---

## 2. Lỗi Database & Migration

### ❌ Lỗi 2.1: Enum values không match giữa Java và Database

**Nguyên nhân:**

-   Database dùng lowercase (`admin`, `customer`)
-   Java enum dùng UPPERCASE (`ADMIN`, `CUSTOMER`)

**Triệu chứng:**

```
org.postgresql.util.PSQLException: ERROR: new row for relation "profiles" violates check constraint
```

**Cách fix:**

```sql
-- ✅ ĐÚNG - Database dùng UPPERCASE
CREATE TYPE profile_role AS ENUM ('GUEST', 'CUSTOMER', 'AGENT', 'SUPPLIER', 'STAFF', 'ADMIN');

-- hoặc với VARCHAR + CHECK constraint:
role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER'
CHECK (role IN ('GUEST', 'CUSTOMER', 'AGENT', 'SUPPLIER', 'STAFF', 'ADMIN'))
```

```java
// ✅ Java enum cũng UPPERCASE
public enum ProfileRole {
    GUEST, CUSTOMER, AGENT, SUPPLIER, STAFF, ADMIN
}

@Enumerated(EnumType.STRING)
@Column(nullable = false)
private ProfileRole role = ProfileRole.CUSTOMER;
```

**Bài học:**

-   Enum values phải match CHÍNH XÁC giữa DB và Java
-   Nên dùng UPPERCASE cho cả DB và Java để tránh confusion

---

### ❌ Lỗi 2.2: Quên thêm is_active cho soft delete

**Nguyên nhân:**

-   Implement soft delete nhưng thiếu column `is_active` trong table

**Cách fix đúng:**

**Migration SQL:**

```sql
-- Thêm is_active column vào các bảng cần soft delete
ALTER TABLE areas ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE categories ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE coupons ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE product_units ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
```

**Entity:**

```java
@Column(name = "is_active", nullable = false)
private Boolean isActive = true;
```

**Repository:**

```java
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByIsActive(Boolean isActive);
}
```

**Service:**

```java
// ❌ SAI - Hard delete
public void delete(Long id) {
    categoryRepository.deleteById(id);
}

// ✅ ĐÚNG - Soft delete
public void delete(Long id) {
    Category category = findById(id);
    category.setIsActive(false);
    categoryRepository.save(category);
}

// Chỉ trả về active records
public List<Category> findAll() {
    return categoryRepository.findByIsActive(true);
}
```

**Bài học:**

-   Soft delete cần: is_active column + update service layer để filter
-   Không được dùng `deleteById()` - phải set `isActive = false`

---

### ❌ Lỗi 2.3: Nhầm lẫn giữa is_active và is_selling

**Nguyên nhân:**

-   `is_active`: Dùng cho soft delete (ẩn record khỏi hệ thống)
-   `is_selling`: Dùng cho business logic (sản phẩm có đang bán không)

**Cách fix:**

```java
// product_units table cần CẢ 2 fields
@Column(name = "is_active", nullable = false)
private Boolean isActive = true; // Soft delete

@Column(name = "is_selling", nullable = false)
private Boolean isSelling = true; // Business status

// Repository queries
List<ProductUnit> findByIsActive(Boolean isActive);
List<ProductUnit> findByIsActiveAndIsSelling(Boolean isActive, Boolean isSelling);
```

**Use cases:**

-   Sản phẩm hết hàng tạm thời: `is_active=true, is_selling=false`
-   Sản phẩm ngừng kinh doanh vĩnh viễn: `is_active=false, is_selling=false`
-   Sản phẩm đang bán: `is_active=true, is_selling=true`

**Bài học:**

-   `is_active`: Technical (soft delete)
-   `is_selling`: Business logic (có đang bán không)
-   Không được dùng chung 1 field cho 2 mục đích

---

## 3. Lỗi Backend - Spring Boot

### ❌ Lỗi 3.1: Circular Reference khi serialize JSON

**Nguyên nhân:**

-   Bidirectional relationship giữa `Order` và `OrderItem`
-   Jackson serialize `Order` → `items` → `order` → `items` (infinite loop)

**Triệu chứng:**

```
com.fasterxml.jackson.databind.JsonMappingException: Infinite recursion (StackOverflowError)
```

**Cách fix:**

```java
// Order.java
@Entity
@Table(name = "orders")
public class Order {
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonManagedReference // ← Serialize này (parent side)
    private List<OrderItem> items;
}

// OrderItem.java
@Entity
@Table(name = "order_items")
public class OrderItem {
    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonBackReference // ← KHÔNG serialize này (child side)
    private Order order;
}
```

**Alternatives:**

```java
// Cách 2: Dùng @JsonIgnore
@ManyToOne
@JsonIgnore
private Order order;

// Cách 3: Dùng DTO (recommended cho production)
public class OrderDTO {
    private Long id;
    private String orderNo;
    private List<OrderItemDTO> items; // DTO không có reference ngược
}
```

**Bài học:**

-   Bidirectional relationships cần `@JsonManagedReference` / `@JsonBackReference`
-   Production nên dùng DTO thay vì expose entity trực tiếp

---

### ❌ Lỗi 3.2: Missing PUT endpoint cho update operations

**Nguyên nhân:**

-   Frontend gọi `PUT /api/orders/1` nhưng backend chỉ có GET/POST

**Triệu chứng:**

```
405 Method Not Allowed
```

**Cách fix:**

```java
// Controller
@PutMapping("/{id}")
public ResponseEntity<Order> update(@PathVariable Long id, @RequestBody Order order) {
    Order updated = orderService.update(id, order);
    return ResponseEntity.ok(updated);
}

// Service - Chỉ cho phép update một số fields
public Order update(Long id, Order updateData) {
    Order existing = findById(id);

    // Chỉ update status và notes (business requirement)
    if (updateData.getStatus() != null) {
        existing.setStatus(updateData.getStatus());
    }
    if (updateData.getNotes() != null) {
        existing.setNotes(updateData.getNotes());
    }

    return orderRepository.save(existing);
}
```

**Bài học:**

-   Kiểm tra frontend cần method nào (GET/POST/PUT/DELETE) trước khi code
-   Update operation nên giới hạn fields được phép thay đổi (security)

---

## 4. Lỗi Frontend - Next.js

### ❌ Lỗi 4.1: Interface không match backend response

**Nguyên nhân:**

-   Frontend expect `buyerName: string`
-   Backend trả về `buyer: { id, name, email, phone }`

**Triệu chứng:**

```typescript
// ❌ SAI
interface Order {
    buyerName: string; // Backend không trả về field này
}

// Render
<td>{order.buyerName}</td>; // undefined
```

**Cách fix:**

```typescript
// ✅ ĐÚNG - Match backend structure
interface Order {
    id: number;
    orderNo: string;
    buyer?: {
        // Nullable vì Guest orders không có buyer
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    deliveryName: string; // Thông tin giao hàng
    deliveryPhone: string;
    deliveryAddress: string;
    // ...
}

// Render với optional chaining
<td>{order.buyer?.name || order.deliveryName}</td>;
```

**Bài học:**

-   Console.log() backend response để xem exact structure
-   Dùng optional chaining (`?.`) cho nullable fields
-   TypeScript interface phải match 100% với backend JSON

---

### ❌ Lỗi 4.2: Array.isArray() check trước khi .filter()

**Nguyên nhân:**

-   Backend có thể trả về `null` hoặc object thay vì array
-   Gọi `.filter()` trên non-array gây crash

**Triệu chứng:**

```typescript
// ❌ SAI
const filteredOrders = orders.filter((o) => o.status === selectedStatus);
// TypeError: orders.filter is not a function
```

**Cách fix:**

```typescript
// ✅ ĐÚNG
const response = await api.get<Order[]>("/orders");

if (Array.isArray(response.data)) {
    setOrders(response.data);
} else {
    console.error("Expected array but got:", typeof response.data);
    setOrders([]);
}

// Hoặc defensive programming
const safeOrders = Array.isArray(orders) ? orders : [];
const filteredOrders = safeOrders.filter((o) => o.status === selectedStatus);
```

**Bài học:**

-   Luôn validate data type trước khi dùng array methods
-   Backend lỗi có thể trả về object `{ error: "..." }` thay vì array

---

### ❌ Lỗi 4.3: Unused imports/variables gây warning

**Nguyên nhân:**

-   Refactor code nhưng quên xóa imports cũ

**Triệu chứng:**

```typescript
import { useAuthStore } from "@/store/auth-store"; // ← Không dùng nữa
const isAdmin = user?.role === "ADMIN"; // ← Variable không được dùng
```

**Cách fix:**

```typescript
// ✅ Xóa unused imports và variables
// Chỉ import những gì thực sự cần
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
```

**Bài học:**

-   ESLint/TypeScript sẽ warning về unused code
-   Cleanup code sau khi refactor để maintain readability

---

## 5. Lỗi API Integration

### ❌ Lỗi 5.1: Session cookies không được gửi trong requests

**Nguyên nhân:**

-   Axios không gửi credentials mặc định

**Triệu chứng:**

-   Login thành công nhưng các request sau bị 401 Unauthorized

**Cách fix:**

```typescript
// ✅ lib/api.ts - Enable credentials globally
import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
    withCredentials: true, // ← Quan trọng: gửi cookies
    headers: {
        "Content-Type": "application/json",
    },
});
```

**Backend CORS config:**

```java
configuration.setAllowCredentials(true); // ← Must be true
configuration.setAllowedOrigins(List.of("http://localhost:3000")); // Specific origin, không dùng "*"
```

**Bài học:**

-   Session-based auth cần `withCredentials: true` (frontend) + `allowCredentials: true` (backend)
-   CORS với credentials không được dùng wildcard `*`

---

### ❌ Lỗi 5.2: API call nhiều lần không cần thiết

**Nguyên nhân:**

-   Gọi API trong useEffect không có dependency control

**Triệu chứng:**

```typescript
// ❌ SAI - Gọi mỗi lần re-render
useEffect(() => {
    fetchOrders();
}); // No dependency array
```

**Cách fix:**

```typescript
// ✅ ĐÚNG - Chỉ gọi 1 lần khi mount
useEffect(() => {
    fetchOrders();
}, []); // Empty dependency array

// ✅ Gọi lại khi dependency thay đổi
useEffect(() => {
    fetchOrders();
}, [selectedStatus, searchTerm]); // Re-fetch khi filter thay đổi
```

**Bài học:**

-   Luôn specify dependency array cho useEffect
-   Empty `[]` = chỉ chạy once on mount
-   `[dep1, dep2]` = chạy lại khi dependencies thay đổi

---

## 6. Best Practices

### ✅ 6.1: Quy trình kiểm tra trước khi commit

**Checklist:**

-   [ ] Backend: `mvn clean compile` pass không lỗi
-   [ ] Frontend: `npm run build` pass không lỗi TypeScript
-   [ ] Test API qua Postman/browser
-   [ ] Check console logs không có errors
-   [ ] Review code đã xóa unused imports/variables
-   [ ] Migration SQL đã test trên local database

---

### ✅ 6.2: Debug strategy khi gặp lỗi

1. **Đọc error message kỹ càng**

    - Line number
    - Stack trace
    - Root cause

2. **Kiểm tra network tab (browser)**

    - Status code (200, 401, 403, 404, 405, 500)
    - Request payload
    - Response body

3. **Console.log() chiến thuật**

    ```typescript
    console.log("📤 Sending request:", payload);
    console.log("📥 Response data:", response.data);
    console.log(
        "🔍 Data type:",
        typeof response.data,
        Array.isArray(response.data)
    );
    ```

4. **Backend logs**

    ```java
    log.info("🔐 Login attempt for: {}", email);
    log.error("❌ Authentication failed: {}", e.getMessage());
    ```

5. **Database check**
    ```sql
    SELECT * FROM profiles WHERE email = 'admin@sauhiep.vn';
    SELECT * FROM orders WHERE status = 'PENDING';
    ```

---

### ✅ 6.3: Naming conventions

**Database:**

-   Tables: `snake_case` plural (`orders`, `product_units`)
-   Columns: `snake_case` (`order_no`, `is_active`)
-   Enums: `SCREAMING_SNAKE_CASE` (`ORDER_STATUS`, `PROFILE_ROLE`)
-   Enum values: `UPPERCASE` (`PENDING`, `CONFIRMED`, `ADMIN`)

**Java:**

-   Classes: `PascalCase` (`OrderService`, `ProfileDTO`)
-   Methods: `camelCase` (`findById`, `updateStatus`)
-   Variables: `camelCase` (`orderRepository`, `isActive`)
-   Constants: `SCREAMING_SNAKE_CASE` (`MAX_RETRY_COUNT`)
-   Enums: `PascalCase` class, `UPPERCASE` values

**TypeScript/JavaScript:**

-   Components: `PascalCase` (`OrdersAdminPage.tsx`)
-   Functions: `camelCase` (`fetchOrders`, `handleSubmit`)
-   Variables: `camelCase` (`selectedOrder`, `isLoading`)
-   Constants: `SCREAMING_SNAKE_CASE` (`API_BASE_URL`)
-   Interfaces: `PascalCase` (`Order`, `OrderItem`)

---

### ✅ 6.4: Security best practices

1. **Passwords:**

    - Luôn hash với BCrypt (strength ≥ 10)
    - Không log passwords
    - Validate độ dài tối thiểu (6-8 chars)

2. **Role-based access:**

    - Guest: Public read-only
    - Customer: Authenticated, own data only
    - Staff: Management operations (no delete)
    - Admin: Full permissions

3. **Input validation:**

    - Backend: `@Valid`, `@NotNull`, `@Email`, etc.
    - Frontend: Form validation trước khi submit
    - SQL injection: Dùng JPA/PreparedStatement, không concat string

4. **Session management:**
    - Session timeout (default 30 phút)
    - Logout phải invalidate session
    - HTTPS trong production

---

### ✅ 6.5: Testing checklist

**API Testing (Postman):**

1. Login để lấy session
2. Test unauthorized access (không login)
3. Test forbidden access (wrong role)
4. Test CRUD operations đầy đủ
5. Test edge cases (empty fields, invalid IDs)

**Frontend Testing:**

1. Test với ADMIN role
2. Test với STAFF role (không có delete button)
3. Test với CUSTOMER role
4. Test without login (redirect to login page)
5. Test responsive design (mobile/tablet/desktop)

**Database Testing:**

```sql
-- Test soft delete
UPDATE categories SET is_active = false WHERE id = 1;
SELECT * FROM categories WHERE is_active = true; -- Không thấy id=1

-- Test role-based queries
SELECT * FROM profiles WHERE role = 'ADMIN';

-- Test foreign key constraints
DELETE FROM areas WHERE id IN (SELECT area_id FROM profiles); -- Phải fail
```

---

## 📝 Tóm Tắt - Quy Tắc Vàng

### 🔐 Authentication

-   Dùng `AuthenticationManager` + `UserDetailsService`
-   Roles phải có prefix `ROLE_`
-   Session cookies cần `withCredentials: true`

### 🗄️ Database

-   Enum values: UPPERCASE cả DB và Java
-   Soft delete: `is_active = false`, không dùng `DELETE`
-   Migration: Test trước khi commit

### 🔧 Backend

-   Circular references: Dùng `@JsonManagedReference` / `@JsonBackReference`
-   Update operations: Giới hạn fields được phép thay đổi
-   Logging: Log request/response để debug

### 🎨 Frontend

-   Interfaces phải match backend response chính xác
-   Check `Array.isArray()` trước khi dùng `.filter()`, `.map()`
-   Optional chaining (`?.`) cho nullable fields
-   Cleanup unused imports/variables

### 🔌 Integration

-   CORS: `allowCredentials: true` + specific origins
-   Error handling: Try-catch + user-friendly messages
-   Network debugging: Browser DevTools Network tab

---

## 📚 Tài Liệu Tham Khảo

-   [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
-   [Next.js Documentation](https://nextjs.org/docs)
-   [Axios Documentation](https://axios-http.com/docs/intro)
-   [PostgreSQL Enums](https://www.postgresql.org/docs/current/datatype-enum.html)
-   [BCrypt Online Tool](https://bcrypt-generator.com/)

---

**Ghi chú cuối:** File này nên được update liên tục khi phát hiện thêm lỗi mới hoặc pattern hữu ích. Đọc lại định kỳ để củng cố kiến thức! 💪
