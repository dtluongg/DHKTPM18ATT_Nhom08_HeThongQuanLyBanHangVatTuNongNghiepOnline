package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.StoreSetting;
import com.example.bvtv_www.repository.StoreSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class StoreSettingService {
    private final StoreSettingRepository storeSettingRepository;

    public StoreSetting getStoreSetting() {
        return storeSettingRepository.findAll().stream()
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Store setting not found"));
    }

    public StoreSetting update(StoreSetting storeSetting) {
        StoreSetting existing = getStoreSetting();
        existing.setStoreName(storeSetting.getStoreName());
        existing.setPhone(storeSetting.getPhone());
        existing.setEmail(storeSetting.getEmail());
        existing.setAddress(storeSetting.getAddress());
        return storeSettingRepository.save(existing);
    }
}
