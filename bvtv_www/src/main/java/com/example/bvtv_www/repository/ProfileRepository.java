package com.example.bvtv_www.repository;

import com.example.bvtv_www.entity.Profile;
import com.example.bvtv_www.enums.ProfileRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    
    /**
     * Tìm profile theo email (dùng cho login)
     */
    Optional<Profile> findByEmail(String email);
    
    /**
     * Tìm tất cả profiles theo role
     */
    List<Profile> findByRole(ProfileRole role);
    
    /**
     * Tìm profiles theo role và trạng thái active
     */
    List<Profile> findByRoleAndIsActive(ProfileRole role, Boolean isActive);
    
    /**
     * Kiểm tra email đã tồn tại chưa
     */
    boolean existsByEmail(String email);

    Optional<Profile> findByPhone(String phoneNumber);
}
