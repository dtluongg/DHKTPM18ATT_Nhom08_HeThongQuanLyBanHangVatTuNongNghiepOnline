package com.example.bvtv_www.controller;

import com.example.bvtv_www.entity.ProductUnit;
import com.example.bvtv_www.service.ProductUnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/product-units")
@RequiredArgsConstructor
public class ProductUnitController {
    private final ProductUnitService productUnitService;

    @GetMapping
    public ResponseEntity<List<ProductUnit>> getAll() {
        return ResponseEntity.ok(productUnitService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductUnit> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productUnitService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProductUnit> create(@RequestBody ProductUnit product) {
        return ResponseEntity.ok(productUnitService.create(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductUnit> update(@PathVariable Long id, @RequestBody ProductUnit product) {
        return ResponseEntity.ok(productUnitService.update(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productUnitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
