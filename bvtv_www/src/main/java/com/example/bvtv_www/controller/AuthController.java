package com.example.bvtv_www.controller;

import com.example.bvtv_www.dto.LoginRequest;
import com.example.bvtv_www.dto.RegisterRequest;
import com.example.bvtv_www.entity.Profile;
import com.example.bvtv_www.enums.ProfileRole;
import com.example.bvtv_www.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

/**
 * Authentication Controller
 * Xử lý đăng ký, đăng nhập, đăng xuất
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

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
     * Đăng nhập - Sử dụng AuthenticationManager để Spring Security nhận diện role
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            // Authenticate user với Spring Security
            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
            
            Authentication authentication = authenticationManager.authenticate(authToken);
            
            // Lưu authentication vào SecurityContext
            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);
            
            // Lưu SecurityContext vào session để persist qua các request
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);
            
            // Lấy thông tin user để trả về
            Profile profile = profileRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Trả về thông tin user
            Map<String, Object> response = new HashMap<>();
            response.put("id", profile.getId());
            response.put("email", profile.getEmail());
            response.put("name", profile.getName());
            response.put("phone", profile.getPhone());
            response.put("address", profile.getAddress());
            response.put("role", profile.getRole().name());

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Email hoặc mật khẩu không đúng"));
        }
    }

    /**
     * Đăng xuất
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
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
