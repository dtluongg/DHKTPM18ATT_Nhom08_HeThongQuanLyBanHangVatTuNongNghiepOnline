package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.InventoryMovement;
import com.example.bvtv_www.repository.InventoryMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryMovementService {
    private final InventoryMovementRepository inventoryMovementRepository;

    public List<InventoryMovement> findAll() {
        return inventoryMovementRepository.findAll();
    }

    public InventoryMovement findById(Long id) {
        return inventoryMovementRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Inventory movement not found"));
    }

    public InventoryMovement create(InventoryMovement movement) {
        return inventoryMovementRepository.save(movement);
    }
}
