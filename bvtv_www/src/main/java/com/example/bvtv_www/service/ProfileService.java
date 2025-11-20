package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.Profile;
import com.example.bvtv_www.entity.Order;
import com.example.bvtv_www.repository.ProfileRepository;
import com.example.bvtv_www.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final ProfileRepository profileRepository;
    private final OrderRepository orderRepository;

    public List<Profile> findAll() {
        return profileRepository.findAll();
    }

    public Profile findById(UUID id) {
        return profileRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    public Profile findByEmail(String email) {
        return profileRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Profile not found with email: " + email));
    }

    public Profile findbyPhoneNumber(String phone) {
        return profileRepository.findByPhone(phone)
            .orElseThrow(() -> new RuntimeException("Profile not found with phone number: " + phone));
    }

    public Profile create(Profile profile) {
        return profileRepository.save(profile);
    }

    public Profile update(UUID id, Profile profile) {
        Profile existing = findById(id);
        existing.setName(profile.getName());
        existing.setSortName(profile.getSortName());
        existing.setPhone(profile.getPhone());
        existing.setAddress(profile.getAddress());
        return profileRepository.save(existing);
    }

    public void delete(UUID id) {
        // Soft delete: set isActive = false
        Profile existing = findById(id);
        existing.setIsActive(false);
        profileRepository.save(existing);
    }

    public List<Order> getOrdersByProfileId(UUID profileId) {
        Profile profile = findById(profileId);
        return orderRepository.findByBuyer(profile);
    }
}
