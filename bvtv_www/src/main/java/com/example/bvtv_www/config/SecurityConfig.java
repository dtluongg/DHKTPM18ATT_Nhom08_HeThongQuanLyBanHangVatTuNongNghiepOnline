package com.example.bvtv_www.config;

import com.example.bvtv_www.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security Configuration
 * =====================
 * Phân quyền theo vai trò:
 * - GUEST: Xem sản phẩm, danh mục, tạo đơn hàng (không cần đăng nhập)
 * - CUSTOMER: Xem đơn hàng của mình, quản lý profile
 * - STAFF: Quản lý đơn hàng, sản phẩm, khách hàng (không quản lý user và cấu hình hệ thống)
 * - ADMIN: Toàn quyền
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {}) // Enable CORS với config từ CorsConfig.java
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // ============================================================
                // AUTH ENDPOINTS - Public access
                // ============================================================
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/status").permitAll()
                
                // ============================================================
                // GUEST - Public read access (không cần đăng nhập)
                // ============================================================
                .requestMatchers(HttpMethod.GET, "/api/product-units/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/payment-methods/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/coupons/validate/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/areas/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/store-settings/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/orders").permitAll() // Guest tạo đơn
                
                // ============================================================
                // CUSTOMER - Authenticated users (đã đăng nhập)
                // ============================================================
                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/orders/my-orders").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/profiles/me").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/profiles/me").authenticated()
                
                // ============================================================
                // STAFF + ADMIN - Management endpoints
                // ============================================================
                // Orders management
                .requestMatchers(HttpMethod.GET, "/api/orders/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/orders/**").hasAnyRole("STAFF", "ADMIN")
                
                // Product management
                .requestMatchers(HttpMethod.POST, "/api/product-units/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/product-units/**").hasAnyRole("STAFF", "ADMIN")
                
                // Category management
                .requestMatchers(HttpMethod.POST, "/api/categories/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasAnyRole("STAFF", "ADMIN")
                
                // Coupon management
                .requestMatchers(HttpMethod.POST, "/api/coupons/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/coupons/**").hasAnyRole("STAFF", "ADMIN")
                
                // Area management
                .requestMatchers(HttpMethod.POST, "/api/areas/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/areas/**").hasAnyRole("STAFF", "ADMIN")
                
                // Profile management
                .requestMatchers(HttpMethod.GET, "/api/profiles").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/profiles").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/profiles/**").hasAnyRole("STAFF", "ADMIN")
                
                // ============================================================
                // ADMIN ONLY - Delete operations
                // ============================================================
                .requestMatchers(HttpMethod.DELETE, "/api/product-units/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/coupons/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/areas/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/profiles/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasRole("ADMIN")
                
                // Default: require authentication
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider()) // Sử dụng custom UserDetailsService
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(formLogin -> formLogin.disable());
        
        return http.build();
    }
}
