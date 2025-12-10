package com.example.bvtv_www.controller;

import com.example.bvtv_www.entity.ProductUnit;
import com.example.bvtv_www.service.FileUploadService;
import com.example.bvtv_www.service.ProductUnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/product-units")
@RequiredArgsConstructor
public class ProductUnitController {
    private final ProductUnitService productUnitService;
    private final FileUploadService fileUploadService;

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

    /**
     * Upload ảnh cho sản phẩm
     * @param id ID của sản phẩm
     * @param file File ảnh cần upload
     * @return URL của ảnh đã upload
     */
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            // Lấy thông tin sản phẩm để tạo tên file
            ProductUnit product = productUnitService.findById(id);
            
            // Tạo tên file từ product name + product id
            // VD: "Phân Bón NPK 50kg" + id=123 -> "phan-bon-npk-50kg-123"
            String customName = product.getName() + "-" + product.getId();
            
            // Upload file lên Supabase với tên custom
            String imageUrl = fileUploadService.uploadFile(file, "product-units", customName);

            // Xóa ảnh cũ nếu có
            if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                try {
                    fileUploadService.deleteFile(product.getImageUrl());
                } catch (Exception e) {
                    // Log warning nhưng không throw error
                    System.err.println("Warning: Could not delete old image: " + e.getMessage());
                }
            }

            // Cập nhật imageUrl vào database
            product.setImageUrl(imageUrl);
            productUnitService.update(id, product);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("message", "Upload ảnh thành công");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi upload ảnh: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
