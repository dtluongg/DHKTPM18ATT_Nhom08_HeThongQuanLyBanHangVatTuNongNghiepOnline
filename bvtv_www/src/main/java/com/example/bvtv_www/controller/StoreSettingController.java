package com.example.bvtv_www.controller;

import com.example.bvtv_www.entity.StoreSetting;
import com.example.bvtv_www.service.StoreSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/store-settings")
@RequiredArgsConstructor
public class StoreSettingController {
    private final StoreSettingService storeSettingService;

    @GetMapping
    public ResponseEntity<StoreSetting> get() {
        return ResponseEntity.ok(storeSettingService.getStoreSetting());
    }

    @PutMapping
    public ResponseEntity<StoreSetting> update(@RequestBody StoreSetting storeSetting) {
        return ResponseEntity.ok(storeSettingService.update(storeSetting));
    }
}
