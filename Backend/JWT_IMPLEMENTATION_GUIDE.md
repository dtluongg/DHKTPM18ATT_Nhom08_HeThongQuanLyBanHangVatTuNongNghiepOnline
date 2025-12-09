# 🔐 JWT Authentication Implementation Guide

**Ngày cập nhật:** 9/12/2025  
**Dự án:** Hệ Thống Quản Lý Bán Hàng Vật Tư Nông Nghiệp Online  
**Phiên bản:** JWT v1.0

---

## 📚 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Chi Tiết Các Component](#chi-tiết-các-component)
4. [Luồng Hoạt Động](#luồng-hoạt-động)
5. [So Sánh Session vs JWT](#so-sánh-session-vs-jwt)
6. [Bảo Mật](#bảo-mật)
7. [Testing với Postman](#testing-với-postman)

---

## 🎯 Tổng Quan

### JWT là gì?

**JWT (JSON Web Token)** là một chuỗi ký tự đại diện cho một claim được mã hóa và ký bằng một secret key.

### Ưu Điểm JWT

✅ **Stateless** - Server không cần lưu trữ session  
✅ **Scalable** - Dễ dàng mở rộng với nhiều servers  
✅ **Mobile-friendly** - Phù hợp với mobile apps và SPA  
✅ **Bảo mật** - Signed và có thời gian hết hạn  
✅ **Self-contained** - Token chứa đủ thông tin để verify  

### Nhược Điểm JWT

❌ **Không thể revoke trước hạn** - Token vẫn có hiệu lực đến khi hết hạn  
❌ **Size lớn hơn** - Phải gửi với mỗi request  
❌ **Phức tạp hơn** - Cần quản lý token trên client  

---

## 🏗️ Kiến Trúc Hệ Thống

### Luồng Tổng Quát

```
┌──────────────┐
│   Frontend   │ (Next.js - bvtv-shop)
└──────┬───────┘
       │ HTTP Request + JWT Token
       ↓
┌──────────────────────────────────────────────────────┐
│              Backend (Spring Boot)                   │
├──────────────────────────────────────────────────────┤
│  1. JwtAuthenticationFilter                          │
│     ├─ Extract JWT từ Authorization header           │
│     ├─ Validate token                                │
│     └─ Load user từ DB & set SecurityContext         │
│                                                      │
│  2. SecurityConfig                                   │
│     ├─ Kiểm tra authorization rules                  │
│     └─ Kiểm tra role & permissions                   │
│                                                      │
│  3. Controller                                       │
│     └─ Xử lý business logic                          │
│                                                      │
│  4. CustomUserDetailsService                         │
│     └─ Load user từ database                         │
└──────────────────────────────────────────────────────┘
       ↑ HTTP Response + Data
       │
┌──────┴───────┐
│   Frontend   │
└──────────────┘
```

---

## 🔍 Chi Tiết Các Component

### 1. JwtTokenProvider.java

**Vị trí:** `src/main/java/com/example/bvtv_www/config/JwtTokenProvider.java`

**Chức năng:** Tạo, validate, và extract thông tin từ JWT tokens

#### A. Tạo Token

```java
public String generateToken(Authentication authentication) {
    String email = authentication.getName();
    String role = authentication.getAuthorities().stream()
            .findFirst()
            .map(auth -> auth.getAuthority().replace("ROLE_", ""))
            .orElse("");

    return Jwts.builder()
            .subject(email)                    // Payload: email
            .claim("role", role)               // Payload: role tùy chỉnh
            .issuedAt(new Date())              // Thời gian tạo
            .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
}
```

**Chi tiết:**
- `subject(email)` - Lưu email làm identifier chính của token
- `claim("role", role)` - Thêm claim tùy chỉnh (role của user)
- `issuedAt()` - Ghi lại thời gian tạo token
- `expiration()` - Xác định token hết hạn sau bao lâu (24 giờ)
- `signWith(key, algorithm)` - Ký token bằng secret key với thuật toán HS512
- `compact()` - Nén thành string

**Kết quả JWT:**
```
eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzMzNzcwNDAwLCJleHAiOjE3MzM4NTY4MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV...

│ Header (Base64)  │ Payload (Base64)              │ Signature (HMAC-SHA512) │
```

#### B. Validate Token

```java
public boolean validateToken(String token) {
    try {
        Jwts.parser()
                .verifyWith(getSigningKey())     // Verify signature
                .build()
                .parseSignedClaims(token);       // Parse & validate
        return true;
    } catch (MalformedJwtException ex) {
        System.err.println("Invalid JWT token");
    } catch (ExpiredJwtException ex) {
        System.err.println("Token đã hết hạn");
    } catch (UnsupportedJwtException ex) {
        System.err.println("Token format không được hỗ trợ");
    } catch (IllegalArgumentException ex) {
        System.err.println("Token claims empty");
    }
    return false;
}
```

**Kiểm tra:**
1. ✅ Signature có hợp lệ? (verify bằng secret key)
2. ✅ Token chưa hết hạn?
3. ✅ Format token có đúng?
4. ✅ Claims có hợp lệ?

#### C. Extract Thông Tin từ Token

```java
public String getEmailFromToken(String token) {
    return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();                     // Lấy email từ subject
}

public String getRoleFromToken(String token) {
    return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .get("role", String.class);        // Lấy role từ custom claim
}
```

---

### 2. JwtAuthenticationFilter.java

**Vị trí:** `src/main/java/com/example/bvtv_www/config/JwtAuthenticationFilter.java`

**Chức năng:** Xác thực JWT token từ Authorization header trên mỗi request

```java
@Override
protected void doFilterInternal(HttpServletRequest request, 
                               HttpServletResponse response, 
                               FilterChain filterChain)
        throws ServletException, IOException {
    try {
        // 1. LẤY JWT TOKEN TỪ HEADER
        String jwt = getJwtFromRequest(request);
        
        // 2. VALIDATE TOKEN
        if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
            
            // 3. EXTRACT EMAIL TỪ TOKEN
            String email = tokenProvider.getEmailFromToken(jwt);
            
            // 4. LOAD USER TỪ DATABASE
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            
            // 5. TẠO AUTHENTICATION OBJECT
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        userDetails, 
                        null, 
                        userDetails.getAuthorities()
                    );
            
            // 6. SET VÀO SECURITY CONTEXT
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
    } catch (Exception ex) {
        System.err.println("Could not set user authentication: " + ex.getMessage());
    }
    
    // 7. CHO REQUEST ĐI TIẾP
    filterChain.doFilter(request, response);
}

private String getJwtFromRequest(HttpServletRequest request) {
    String bearerToken = request.getHeader("Authorization");
    if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
        return bearerToken.substring(7);  // Lấy phần sau "Bearer "
    }
    return null;
}
```

**Luồng Chi Tiết:**

```
Request với header:
Authorization: Bearer eyJhbGc...
                      │
                      ↓ getJwtFromRequest()
                      
"eyJhbGc..."  ← Token
      │
      ↓ validateToken()
      
Token hợp lệ? ✅ Tiếp tục
      │
      ↓ getEmailFromToken()
      
email = "test@example.com"
      │
      ↓ userDetailsService.loadUserByUsername()
      
UserDetails {
  username: "test@example.com",
  password: "...",
  authorities: ["ROLE_CUSTOMER"],
  enabled: true
}
      │
      ↓ Tạo Authentication object
      
UsernamePasswordAuthenticationToken {
  principal: UserDetails,
  credentials: null,
  authorities: ["ROLE_CUSTOMER"]
}
      │
      ↓ Set vào SecurityContext
      
SecurityContextHolder.getContext().setAuthentication(auth)
      │
      ↓ filterChain.doFilter() - Request đi tiếp
      
Spring Security biết user đã login với role gì
```

---

### 3. SecurityConfig.java

**Vị trí:** `src/main/java/com/example/bvtv_www/config/SecurityConfig.java`

**Chức năng:** Cấu hình Spring Security với JWT

#### A. Stateless Configuration

```java
.sessionManagement(sessionManagement -> 
    sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
)
```

**Ý nghĩa:**
- ❌ Không tạo HTTP session
- ✅ Mỗi request được xem là độc lập
- ✅ Server không cần lưu trữ trạng thái

#### B. Thêm JWT Filter

```java
.addFilterBefore(
    jwtAuthenticationFilter(), 
    UsernamePasswordAuthenticationFilter.class
)
```

**Chạy trước:** Filter này chạy **trước** `UsernamePasswordAuthenticationFilter` của Spring

**Thứ tự filter:**
1. JwtAuthenticationFilter ← **Chúng ta chạy đầu tiên**
2. UsernamePasswordAuthenticationFilter
3. Các filter khác...
4. AuthorizationFilter (kiểm tra quyền)

#### C. Exception Handling

```java
.exceptionHandling(exceptionHandling -> 
    exceptionHandling.authenticationEntryPoint(jwtAuthenticationEntryPoint)
)
```

Khi token không hợp lệ → JwtAuthenticationEntryPoint xử lý

#### D. Authorization Rules

```java
.authorizeHttpRequests(auth -> auth
    // PUBLIC - Không cần đăng nhập
    .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
    .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
    
    // AUTHENTICATED - Phải đăng nhập
    .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
    .requestMatchers(HttpMethod.GET, "/api/orders/my-orders").authenticated()
    
    // ROLE-BASED - Phải có role cụ thể
    .requestMatchers(HttpMethod.GET, "/api/orders/**").hasAnyRole("STAFF", "ADMIN")
    .requestMatchers(HttpMethod.POST, "/api/product-units/**").hasRole("ADMIN")
    
    // DEFAULT - Tất cả request khác cần đăng nhập
    .anyRequest().authenticated()
)
```

---

### 4. JwtAuthenticationEntryPoint.java

**Vị trí:** `src/main/java/com/example/bvtv_www/config/JwtAuthenticationEntryPoint.java`

**Chức năng:** Xử lý lỗi khi JWT không hợp lệ

```java
@Override
public void commence(HttpServletRequest request, 
                    HttpServletResponse response,
                    AuthenticationException authException) 
        throws IOException, ServletException {
    
    response.setContentType("application/json");
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);  // 401

    final Map<String, Object> body = new HashMap<>();
    body.put("status", 401);
    body.put("error", "Unauthorized");
    body.put("message", "JWT token không hợp lệ hoặc không được cung cấp");
    body.put("path", request.getServletPath());

    final ObjectMapper mapper = new ObjectMapper();
    mapper.writeValue(response.getOutputStream(), body);
}
```

**Response (401):**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token không hợp lệ hoặc không được cung cấp",
  "path": "/api/auth/me"
}
```

---

### 5. AuthController.java

**Vị trí:** `src/main/java/com/example/bvtv_www/controller/AuthController.java`

#### A. Register

```java
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    // 1. Kiểm tra email đã tồn tại
    if (profileRepository.findByEmail(request.getEmail()).isPresent()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Email đã được sử dụng"));
    }

    // 2. Tạo profile mới
    Profile profile = new Profile();
    profile.setEmail(request.getEmail());
    profile.setPasswordHash(passwordEncoder.encode(request.getPassword())); // ← Mã hóa
    profile.setName(request.getName());
    profile.setPhone(request.getPhone());
    profile.setAddress(request.getAddress());
    profile.setRole(ProfileRole.CUSTOMER);  // Mặc định
    profile.setIsActive(true);

    // 3. Lưu vào database
    profileRepository.save(profile);

    return ResponseEntity.ok(Map.of("message", "Đăng ký thành công"));
}
```

#### B. Login

```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    try {
        // 1. AUTHENTICATE USER
        UsernamePasswordAuthenticationToken authToken = 
            new UsernamePasswordAuthenticationToken(
                request.getEmail(), 
                request.getPassword()
            );
        
        Authentication authentication = authenticationManager.authenticate(authToken);
        
        // 2. GENERATE JWT TOKEN
        String token = jwtTokenProvider.generateToken(authentication);
        
        // 3. LẤY THÔNG TIN USER
        Profile profile = profileRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // 4. TRẢ VỀ RESPONSE
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", profile.getId());
        response.put("email", profile.getEmail());
        response.put("name", profile.getName());
        response.put("role", profile.getRole().name());

        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Email hoặc mật khẩu không đúng"));
    }
}
```

#### C. Logout

```java
@PostMapping("/logout")
public ResponseEntity<?> logout() {
    // JWT là stateless - không cần làm gì phía server
    // Client chỉ cần xóa token từ localStorage
    return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
}
```

#### D. Get Current User

```java
@GetMapping("/me")
public ResponseEntity<?> getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    
    if (authentication == null || !authentication.isAuthenticated()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Chưa đăng nhập"));
    }

    String email = authentication.getName();
    Profile profile = profileRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Map<String, Object> response = new HashMap<>();
    response.put("id", profile.getId());
    response.put("email", profile.getEmail());
    response.put("name", profile.getName());
    response.put("role", profile.getRole().name());
    response.put("isActive", profile.getIsActive());

    return ResponseEntity.ok(response);
}
```

---

### 6. CustomUserDetailsService.java

**Vị trí:** `src/main/java/com/example/bvtv_www/service/CustomUserDetailsService.java`

**Chức năng:** Load user từ database theo email

```java
@Override
public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    Profile profile = profileRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

    return User.builder()
        .username(profile.getEmail())                      // Email
        .password(profile.getPasswordHash())               // Mật khẩu BCrypt
        .authorities(getAuthorities(profile))              // Roles
        .accountExpired(false)
        .accountLocked(false)
        .credentialsExpired(false)
        .disabled(!profile.getIsActive())                  // Check isActive
        .build();
}

private Collection<? extends GrantedAuthority> getAuthorities(Profile profile) {
    String role = "ROLE_" + profile.getRole().name();
    return Collections.singletonList(new SimpleGrantedAuthority(role));
}
```

**Ví dụ:**
```
Input: email = "test@example.com"
       │
       ↓ Query database
       
Profile {
  email: "test@example.com",
  passwordHash: "$2a$10$...",  // BCrypt
  role: CUSTOMER,
  isActive: true
}
       │
       ↓ Chuyển đổi thành UserDetails
       
UserDetails {
  username: "test@example.com",
  password: "$2a$10$...",
  authorities: [ROLE_CUSTOMER],
  enabled: true  (từ isActive)
}
```

---

## 🔄 Luồng Hoạt Động

### 1️⃣ ĐĂNG KÝ (Register)

```
Client POST /api/auth/register
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User",
  "phone": "0123456789",
  "address": "123 Street"
}
│
↓ AuthController.register()
├─ Kiểm tra email trùng?
├─ Mã hóa mật khẩu: BCrypt("password123") → "$2a$10$..."
├─ Tạo Profile mới (role=CUSTOMER, isActive=true)
├─ Lưu vào database
│
↓ Response 200 OK
{
  "message": "Đăng ký thành công"
}
```

### 2️⃣ ĐĂNG NHẬP (Login)

```
Client POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
│
↓ AuthController.login()
├─ Tạo authToken = UsernamePasswordAuthenticationToken(email, password)
│
├─ authenticationManager.authenticate(authToken)
│  ├─ CustomUserDetailsService.loadUserByUsername("test@example.com")
│  │  ├─ Query DB: findByEmail()
│  │  ├─ Tìm được Profile
│  │  ├─ Chuyển thành UserDetails với role="ROLE_CUSTOMER"
│  │  └─ Return UserDetails
│  │
│  └─ Spring Security so sánh mật khẩu:
│     BCrypt("password123") == "$2a$10$..."  ?
│     → ✅ Khớp!
│     → Return Authentication với roles
│
├─ jwtTokenProvider.generateToken(authentication)
│  └─ Tạo JWT:
│     - subject: "test@example.com"
│     - role: "CUSTOMER"
│     - expiration: now + 24h
│     - signature: HMAC-SHA512(secret)
│     → Token = "eyJhbGc..."
│
├─ Lấy thông tin user từ database
│
↓ Response 200 OK
{
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "id": "uuid",
  "email": "test@example.com",
  "name": "Test User",
  "role": "CUSTOMER"
}

Client lưu token vào localStorage
```

### 3️⃣ REQUEST VỚI TOKEN

```
Client GET /api/auth/me
Header: Authorization: Bearer eyJhbGc...
│
↓ JwtAuthenticationFilter.doFilterInternal()
├─ getJwtFromRequest()
│  ├─ Lấy header "Authorization"
│  ├─ Tách "Bearer " → "eyJhbGc..."
│  └─ Return token
│
├─ tokenProvider.validateToken(token)
│  ├─ Verify signature (HMAC-SHA512)
│  ├─ Check expiration
│  └─ Return ✅ true
│
├─ tokenProvider.getEmailFromToken(token)
│  └─ Extract subject → "test@example.com"
│
├─ userDetailsService.loadUserByUsername("test@example.com")
│  ├─ Load từ database
│  └─ Return UserDetails với role="ROLE_CUSTOMER"
│
├─ Tạo Authentication object
│  └─ UsernamePasswordAuthenticationToken(
│       principal=UserDetails,
│       credentials=null,
│       authorities=[ROLE_CUSTOMER]
│     )
│
├─ SecurityContextHolder.getContext().setAuthentication(auth)
│  └─ SecurityContext biết user đã login
│
↓ filterChain.doFilter() - Request đi tiếp
│
↓ SecurityConfig kiểm tra rule:
│  .requestMatchers(GET, "/api/auth/me").authenticated()
│  ├─ Cần đăng nhập? ✅ Có
│  ├─ User đã authenticated? ✅ Đúng (từ SecurityContext)
│  └─ Cho phép!
│
↓ AuthController.getCurrentUser()
├─ Lấy authentication từ SecurityContext
├─ Extract email → "test@example.com"
├─ Load profile từ database
│
↓ Response 200 OK
{
  "id": "uuid",
  "email": "test@example.com",
  "name": "Test User",
  "role": "CUSTOMER",
  "isActive": true
}
```

### 4️⃣ KIỂM TRA QUYỀN (Authorization)

```
Client POST /api/product-units
Header: Authorization: Bearer eyJhbGc...
Body: { "name": "...", ... }
│
↓ JwtAuthenticationFilter (giống như trên)
├─ Validate token ✅
├─ Load user → role="CUSTOMER"
├─ Set SecurityContext
│
↓ SecurityConfig kiểm tra rule:
│  .requestMatchers(POST, "/api/product-units/**").hasRole("ADMIN")
│  ├─ Cần role ADMIN?  ✅ Có
│  ├─ User có role ADMIN? ❌ KHÔNG (chỉ có CUSTOMER)
│  ├─ Throw AccessDeniedException
│
↓ Spring Security catch & return:
│  HTTP 403 Forbidden
{
  "status": 403,
  "error": "Forbidden",
  "message": "Bạn không có quyền truy cập tài nguyên này"
}
```

### 5️⃣ TOKEN HẾT HẠN

```
Token đã hết hạn (expired > 24h) 
│
Client gửi lại request với expired token
│
↓ JwtAuthenticationFilter
├─ getJwtFromRequest() → Extract token
│
├─ tokenProvider.validateToken(token)
│  ├─ Jwts.parser().parseSignedClaims(token)
│  ├─ Check expiration: now > expiration?
│  ├─ ✅ YES! → Throw ExpiredJwtException
│  └─ Return ❌ false
│
├─ StringUtils.hasText(jwt) && validateToken(jwt) ? ❌ false
├─ Skip setting authentication
│
↓ filterChain.doFilter() - Request đi tiếp nhưng...
│
↓ SecurityConfig kiểm tra rule:
│  .requestMatchers(...).authenticated()
│  ├─ SecurityContext.getAuthentication() = null
│  ├─ Cần đăng nhập? ✅ Có
│  ├─ User đã authenticated? ❌ KHÔNG
│  ├─ Throw AuthenticationException
│
↓ JwtAuthenticationEntryPoint.commence()
│  
↓ HTTP 401 Unauthorized
{
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token không hợp lệ hoặc không được cung cấp"
}

Client cần đăng nhập lại để lấy token mới
```

---

## 🆚 So Sánh Session vs JWT

| **Tiêu Chí** | **Session-based (Cũ)** | **JWT (Mới)** |
|--------------|------------------------|---------------|
| **Cơ chế lưu trữ** | Server lưu session | Client lưu token |
| **Client gửi gì** | Cookie (tự động) | Authorization header |
| **Kích thước** | Nhỏ (chỉ ID session) | Lớn hơn (chứa data) |
| **Logout** | Server xóa session | Client xóa token |
| **Stateless** | ❌ Không | ✅ Có |
| **Scalability** | ⚠️ Khó (sync session) | ✅ Dễ (verify locally) |
| **Mobile app** | ❌ Khó (cookie vấn đề) | ✅ Dễ (header đơn giản) |
| **Token revoke** | ✅ Ngay lập tức | ❌ Không thể revoke |
| **CORS** | ❌ Phức tạp | ✅ Đơn giản |
| **Deployment** | Cần shared session store | Không cần |

**Ví dụ:**

**Session-based:**
```
Request 1: POST /login
Response: Set-Cookie: sessionId=abc123; HttpOnly

Request 2: GET /api/user (tự động gửi cookie)
Cookie: sessionId=abc123
→ Server tìm session abc123 trong memory/Redis
→ Validate & load user
```

**JWT-based:**
```
Request 1: POST /login
Response: {"token": "eyJhbGc...", "user": {...}}

Request 2: GET /api/user (manual gửi token)
Authorization: Bearer eyJhbGc...
→ Server verify signature
→ Extract user info từ token
→ Load additional data từ DB nếu cần
```

---

## 🔒 Bảo Mật

### 1. Secret Key

```properties
# ❌ BAD - Quá ngắn
jwt.secret=secret

# ❌ BAD - Công khai
jwt.secret=my-app-secret-key

# ✅ GOOD - Đủ dài (≥32 ký tự)
jwt.secret=your-super-secret-key-change-this-in-production-min-32-chars
```

**Tại sao phải 32+ ký tự?**
- HMAC-SHA512 yêu cầu key đủ mạnh
- JJWT sẽ cảnh báo nếu key quá ngắn

### 2. Token Expiration

```properties
jwt.expiration=86400000  # 24 giờ (ms)
```

**Thời gian hợp lý:**
- Access Token: 15-60 phút
- Refresh Token: 7-30 ngày
- Hiện tại: 24 giờ

### 3. HTTPS Bắt Buộc

**Development:**
```
http://localhost:8080  ✅ OK
```

**Production:**
```
https://yourdomain.com  ✅ REQUIRED
http://yourdomain.com   ❌ KHÔNG cho phép
```

**Tại sao?** Token đi qua network, HTTPS mã hóa toàn bộ traffic

### 4. Không Lưu Sensitive Data Trong Token

```java
// ❌ BAD
.claim("password", user.getPassword())
.claim("creditCard", "1234-5678-9012-3456")

// ✅ GOOD
.claim("role", user.getRole())
.claim("email", user.getEmail())
```

**Tại sao?** Token là text bình thường, ai cũng decode được payload

### 5. Signature Validation

```java
// ✅ ALWAYS validate signature
Jwts.parser()
    .verifyWith(getSigningKey())  // Verify signature
    .build()
    .parseSignedClaims(token);

// ❌ NEVER skip signature verification
Jwts.parser()
    .build()
    .parseClaimsJwt(token);  // Skip verification - DANGEROUS!
```

### 6. Secure Cookie Flags (nếu lưu token trong cookie)

```
Set-Cookie: jwt=eyJhbGc...; 
            HttpOnly;           ← Không cho JS access
            Secure;             ← Chỉ HTTPS
            SameSite=Strict;    ← Chống CSRF
            Max-Age=86400
```

Hiện tại lưu trong localStorage (frontend sẽ xử lý)

---

## 🧪 Testing với Postman

### Setup

1. **Mở Postman**
2. **Create New Collection:** JWT-Auth-Tests
3. **Create Environment Variables:**
   - `baseUrl` = `http://localhost:8080`
   - `token` = (sẽ update sau login)

### Test Cases

#### 1. Register

```
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User",
  "phone": "0123456789",
  "address": "123 Street"
}

Expected: 200 OK
{
  "message": "Đăng ký thành công"
}
```

#### 2. Login

```
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

Expected: 200 OK
{
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "id": "uuid",
  "email": "test@example.com",
  "name": "Test User",
  "role": "CUSTOMER"
}

POST-request script:
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
```

#### 3. Get Current User

```
GET {{baseUrl}}/api/auth/me
Authorization: Bearer {{token}}

Expected: 200 OK
{
  "id": "uuid",
  "email": "test@example.com",
  "name": "Test User",
  "role": "CUSTOMER",
  "isActive": true
}
```

#### 4. Check Status

```
GET {{baseUrl}}/api/auth/status
Authorization: Bearer {{token}}

Expected: 200 OK
{
  "authenticated": true,
  "email": "test@example.com",
  "name": "Test User",
  "role": "CUSTOMER"
}
```

#### 5. Logout

```
POST {{baseUrl}}/api/auth/logout
Authorization: Bearer {{token}}

Expected: 200 OK
{
  "message": "Đăng xuất thành công"
}

Note: Client xóa token từ localStorage
```

#### 6. Test Invalid Token

```
GET {{baseUrl}}/api/auth/me
Authorization: Bearer invalid-token

Expected: 401 Unauthorized
{
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token không hợp lệ hoặc không được cung cấp",
  "path": "/api/auth/me"
}
```

#### 7. Test Missing Token

```
GET {{baseUrl}}/api/auth/me
(Không có Authorization header)

Expected: 401 Unauthorized
(Giống như trên)
```

#### 8. Test Wrong Password

```
POST {{baseUrl}}/api/auth/login
{
  "email": "test@example.com",
  "password": "wrongpassword"
}

Expected: 401 Unauthorized
{
  "error": "Email hoặc mật khẩu không đúng"
}
```

#### 9. Test Role-Based Access

```
POST {{baseUrl}}/api/product-units
Authorization: Bearer {{token}}  (CUSTOMER token)
Content-Type: application/json
{
  "name": "Product",
  ...
}

Expected: 403 Forbidden
(Chỉ ADMIN có thể tạo sản phẩm)
```

---

## 📋 Configuration Files

### `application.properties`

```properties
# ============================================================
# JWT Configuration
# ============================================================
jwt.secret=your-super-secret-key-change-this-in-production-min-32-chars
jwt.expiration=86400000

# jwt.secret dài ≥ 32 ký tự
# jwt.expiration = 24 giờ = 86400000 ms
```

### `pom.xml`

```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.13.0</version>
</dependency>
```

---

## 📁 Project Structure

```
src/main/java/com/example/bvtv_www/
├── config/
│   ├── CorsConfig.java                    ← CORS configuration
│   ├── JwtAuthenticationEntryPoint.java   ← Error handling
│   ├── JwtAuthenticationFilter.java       ← Token extraction & validation
│   ├── JwtTokenProvider.java              ← Token creation & parsing
│   └── SecurityConfig.java                ← Security rules
├── controller/
│   ├── AuthController.java                ← Login, Register, Logout
│   └── ...
├── service/
│   ├── CustomUserDetailsService.java      ← Load user from DB
│   └── ...
├── entity/
│   ├── Profile.java                       ← User entity
│   └── ...
└── ...
```

---

## 🚀 Deployment Checklist

- [ ] Thay `jwt.secret` bằng key dài & random
- [ ] Set `jwt.expiration` cho phù hợp
- [ ] Sử dụng HTTPS trong production
- [ ] Cấu hình CORS với domain thật
- [ ] Kiểm tra database connection string
- [ ] Review security rules trong `SecurityConfig`
- [ ] Enable logging để monitor JWT errors
- [ ] Test tất cả test cases trước deployment

---

## 📚 Tài Liệu Tham Khảo

- [JJWT Documentation](https://github.com/jwtk/jjwt)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT.io](https://jwt.io)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

## 📝 Lịch Sử Cập Nhật

| Ngày | Phiên Bản | Thay Đổi |
|------|-----------|---------|
| 9/12/2025 | v1.0 | Initial JWT implementation |

---

**Tác giả:** GitHub Copilot  
**Dự án:** DHKTPM18ATT_Nhom08_HeThongQuanLyBanHangVatTuNongNghiepOnline  
**Phiên bản:** JWT v1.0
