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

    public InventoryMovement update(Long id, InventoryMovement movement) {
        InventoryMovement existingMovement = findById(id);
        existingMovement.setProductUnit(movement.getProductUnit());
        existingMovement.setWarehouse(movement.getWarehouse());
        existingMovement.setType(movement.getType());
        existingMovement.setQuantity(movement.getQuantity());
        existingMovement.setRefTable(movement.getRefTable());
        existingMovement.setRefId(movement.getRefId());
        return inventoryMovementRepository.save(existingMovement);
    }

    public void delete(Long id) {
        InventoryMovement movement = findById(id);
        inventoryMovementRepository.delete(movement);
    }
}
