package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.Profile;
import com.example.bvtv_www.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

/**
 * Custom UserDetailsService implementation
 * Chuyển đổi Profile entity thành UserDetails để Spring Security nhận diện role
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final ProfileRepository profileRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Profile profile = profileRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return User.builder()
            .username(profile.getEmail())
            .password(profile.getPasswordHash())
            .authorities(getAuthorities(profile))
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(!profile.getIsActive()) // Nếu isActive = false thì disable account
            .build();
    }

    private Collection<? extends GrantedAuthority> getAuthorities(Profile profile) {
        // Spring Security yêu cầu role phải có prefix "ROLE_"
        String role = "ROLE_" + profile.getRole().name();
        return Collections.singletonList(new SimpleGrantedAuthority(role));
    }
}
