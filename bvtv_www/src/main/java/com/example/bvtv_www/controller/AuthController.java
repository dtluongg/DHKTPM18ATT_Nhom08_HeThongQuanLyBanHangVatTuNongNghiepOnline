package com.example.bvtv_www.controller;

import com.example.bvtv_www.entity.Profile;
import com.example.bvtv_www.enums.ProfileRole;
import com.example.bvtv_www.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Authentication Controller
 * Xử lý đăng ký, đăng nhập, đăng xuất
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(ProfileRepository profileRepository, PasswordEncoder passwordEncoder) {
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Đăng ký tài khoản mới (Customer)
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Kiểm tra email đã tồn tại chưa
        if (profileRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Email đã được sử dụng"));
        }

        // Tạo profile mới
        Profile profile = new Profile();
        profile.setEmail(request.getEmail());
        profile.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        profile.setName(request.getName());
        profile.setPhone(request.getPhone());
        profile.setAddress(request.getAddress());
        profile.setRole(ProfileRole.CUSTOMER); // Mặc định là customer
        profile.setIsActive(true);

        profileRepository.save(profile);

        return ResponseEntity.ok(Map.of("message", "Đăng ký thành công"));
    }

    /**
     * Lấy thông tin user hiện tại
     */
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
        response.put("sortName", profile.getSortName());
        response.put("phone", profile.getPhone());
        response.put("address", profile.getAddress());
        response.put("role", profile.getRole().name());
        response.put("isActive", profile.getIsActive());

        return ResponseEntity.ok(response);
    }

    /**
     * Kiểm tra trạng thái đăng nhập
     */
    @GetMapping("/status")
    public ResponseEntity<?> checkAuthStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        boolean isAuthenticated = authentication != null && 
                                 authentication.isAuthenticated() && 
                                 !"anonymousUser".equals(authentication.getPrincipal());

        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", isAuthenticated);
        
        if (isAuthenticated) {
            String email = authentication.getName();
            profileRepository.findByEmail(email).ifPresent(profile -> {
                response.put("email", profile.getEmail());
                response.put("name", profile.getName());
                response.put("role", profile.getRole().name());
            });
        }

        return ResponseEntity.ok(response);
    }
}

/**
 * DTO cho đăng ký
 */
class RegisterRequest {
    private String email;
    private String password;
    private String name;
    private String phone;
    private String address;

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
