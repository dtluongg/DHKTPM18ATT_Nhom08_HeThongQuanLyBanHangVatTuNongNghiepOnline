package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.Profile;
import com.example.bvtv_www.repository.ProfileRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom UserDetailsService để load user từ database
 * Spring Security sẽ dùng service này để authenticate user
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final ProfileRepository profileRepository;

    public CustomUserDetailsService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Tìm user theo email
        Profile profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Kiểm tra user có active không
        if (!profile.getIsActive()) {
            throw new UsernameNotFoundException("User is not active: " + email);
        }

        // Tạo authorities từ role
        List<GrantedAuthority> authorities = new ArrayList<>();
        // Spring Security yêu cầu prefix "ROLE_" trước tên role
        authorities.add(new SimpleGrantedAuthority("ROLE_" + profile.getRole().name().toUpperCase()));

        // Trả về UserDetails
        return User.builder()
                .username(profile.getEmail())
                .password(profile.getPasswordHash())
                .authorities(authorities)
                .accountLocked(!profile.getIsActive())
                .build();
    }
}
