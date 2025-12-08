package com.example.bvtv_www.controller;

import com.example.bvtv_www.entity.SupplierReturn;
import com.example.bvtv_www.enums.DocumentStatus;
import com.example.bvtv_www.service.SupplierReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API Controller cho Phiếu Trả Hàng NCC (PTHNCC)
 */
@RestController
@RequestMapping("/api/supplier-returns")
@RequiredArgsConstructor
public class SupplierReturnController {
    
    private final SupplierReturnService supplierReturnService;

    @GetMapping
    public ResponseEntity<List<SupplierReturn>> getAll() {
        return ResponseEntity.ok(supplierReturnService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierReturn> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierReturnService.findById(id));
    }

    @GetMapping("/return-no/{returnNo}")
    public ResponseEntity<SupplierReturn> getByReturnNo(@PathVariable String returnNo) {
        return ResponseEntity.ok(supplierReturnService.findByReturnNo(returnNo));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SupplierReturn>> getByStatus(@PathVariable DocumentStatus status) {
        return ResponseEntity.ok(supplierReturnService.findByStatus(status));
    }

    @PostMapping
    public ResponseEntity<SupplierReturn> create(@RequestBody SupplierReturn supplierReturn) {
        return ResponseEntity.ok(supplierReturnService.create(supplierReturn));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierReturn> update(@PathVariable Long id, @RequestBody SupplierReturn supplierReturn) {
        return ResponseEntity.ok(supplierReturnService.update(id, supplierReturn));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<SupplierReturn> approve(@PathVariable Long id) {
        return ResponseEntity.ok(supplierReturnService.approve(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<SupplierReturn> reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        return ResponseEntity.ok(supplierReturnService.reject(id, reason));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<SupplierReturn> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(supplierReturnService.cancel(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        supplierReturnService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
