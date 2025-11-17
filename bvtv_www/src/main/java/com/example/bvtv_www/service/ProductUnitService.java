package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.ProductUnit;
import com.example.bvtv_www.repository.ProductUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductUnitService {
    private final ProductUnitRepository productUnitRepository;

    public List<ProductUnit> findAll() {
        // Chỉ lấy sản phẩm isActive = true (chưa xóa mềm)
        return productUnitRepository.findByIsActive(true);
    }
    
    public List<ProductUnit> findAllActive() {
        // Lấy sản phẩm isActive=true và isSelling=true (đang bán)
        return productUnitRepository.findByIsActiveAndIsSelling(true, true);
    }

    public ProductUnit findById(Long id) {
        return productUnitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public ProductUnit create(ProductUnit product) {
        return productUnitRepository.save(product);
    }

    public ProductUnit update(Long id, ProductUnit product) {
        ProductUnit existing = findById(id);
        existing.setName(product.getName());
        existing.setPrice(product.getPrice());
        existing.setCreditPrice(product.getCreditPrice());
        existing.setStock(product.getStock());
        return productUnitRepository.save(existing);
    }

    public void delete(Long id) {
        // Soft delete: set isActive = false
        ProductUnit existing = findById(id);
        existing.setIsActive(false);
        productUnitRepository.save(existing);
    }
}
