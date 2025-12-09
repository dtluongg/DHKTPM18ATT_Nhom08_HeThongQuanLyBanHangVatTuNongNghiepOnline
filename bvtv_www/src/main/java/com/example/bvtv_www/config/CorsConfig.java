package com.example.bvtv_www.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",      // Next.js dev server
                    "http://localhost:3001",      // Backup port
                    "https://yourdomain.com"      // Production domain (thay bằng domain thật sau)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")              // ✅ Cho phép tất cả headers (Authorization, Content-Type, etc.)
                .maxAge(3600);                    // Cache preflight request 1 giờ
                // ❌ Loại bỏ allowCredentials(true) vì JWT không cần cookies
    }
}
