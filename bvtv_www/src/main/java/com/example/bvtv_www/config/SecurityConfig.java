package com.example.bvtv_www.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Tắt CSRF cho REST API
            .authorizeHttpRequests(auth -> auth
                // ============================================================
                // PUBLIC ENDPOINTS (Guest có thể truy cập)
                // ============================================================
                // Trang chủ, static resources
                .requestMatchers("/", "/index.html", "/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll()
                
                // API công khai - Xem sản phẩm, danh mục
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/payment-methods").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/coupons/validate/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/areas").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/store-settings").permitAll()
                
                // Tạo đơn hàng (Guest có thể đặt hàng không cần đăng nhập)
                .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()
                
                // Authentication endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/register").permitAll()
                
                // ============================================================
                // CUSTOMER ENDPOINTS (Khách hàng đã đăng nhập)
                // ============================================================
                .requestMatchers(HttpMethod.GET, "/api/orders/my-orders").hasAnyRole("CUSTOMER", "ADMIN", "STAFF")
                .requestMatchers(HttpMethod.GET, "/api/profiles/me").hasAnyRole("CUSTOMER", "ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT, "/api/profiles/me").hasAnyRole("CUSTOMER", "ADMIN", "STAFF")
                
                // ============================================================
                // STAFF ENDPOINTS (Nhân viên)
                // ============================================================
                // Quản lý đơn hàng
                .requestMatchers("/api/orders/**").hasAnyRole("STAFF", "ADMIN")
                
                // Quản lý sản phẩm (xem, thêm, sửa - không xóa)
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN") // Chỉ admin mới xóa
                
                // Quản lý danh mục (xem, thêm, sửa - không xóa)
                .requestMatchers(HttpMethod.POST, "/api/categories").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")
                
                // Quản lý khách hàng
                .requestMatchers(HttpMethod.GET, "/api/profiles").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/profiles").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/profiles/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/profiles/**").hasRole("ADMIN")
                
                // Quản lý kho hàng (xem, nhập xuất kho)
                .requestMatchers("/api/inventory-movements/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/warehouses/**").hasAnyRole("STAFF", "ADMIN")
                
                // Quản lý mã giảm giá (xem, thêm, sửa)
                .requestMatchers(HttpMethod.GET, "/api/coupons").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/coupons").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/coupons/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/coupons/**").hasRole("ADMIN")
                
                // Quản lý khu vực/ấp
                .requestMatchers(HttpMethod.POST, "/api/areas").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/areas/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/areas/**").hasRole("ADMIN")
                
                // ============================================================
                // ADMIN ONLY ENDPOINTS
                // ============================================================
                // Quản lý phương thức thanh toán
                .requestMatchers(HttpMethod.POST, "/api/payment-methods").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/payment-methods/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/payment-methods/**").hasRole("ADMIN")
                
                // Quản lý kho hàng (tạo, xóa)
                .requestMatchers(HttpMethod.POST, "/api/warehouses").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/warehouses/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/warehouses/**").hasRole("ADMIN")
                
                // Cấu hình cửa hàng
                .requestMatchers("/api/store-settings/**").hasRole("ADMIN")
                
                // Quản lý user (tạo admin, staff, phân quyền)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // ============================================================
                // Các endpoint còn lại yêu cầu authenticated
                // ============================================================
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/api/auth/login")
                .defaultSuccessUrl("/", true)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessUrl("/")
                .permitAll()
            )
            .httpBasic(basic -> {
                // Enable HTTP Basic cho REST API testing
            });
        
        return http.build();
    }
}
