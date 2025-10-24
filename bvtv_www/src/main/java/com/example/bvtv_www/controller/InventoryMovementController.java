package com.example.bvtv_www.controller;

import com.example.bvtv_www.entity.InventoryMovement;
import com.example.bvtv_www.service.InventoryMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory-movements")
@RequiredArgsConstructor
public class InventoryMovementController {
    private final InventoryMovementService inventoryMovementService;

    @GetMapping
    public ResponseEntity<List<InventoryMovement>> getAll() {
        return ResponseEntity.ok(inventoryMovementService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryMovement> getById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryMovementService.findById(id));
    }

    @PostMapping
    public ResponseEntity<InventoryMovement> create(@RequestBody InventoryMovement movement) {
        return ResponseEntity.ok(inventoryMovementService.create(movement));
    }
}
