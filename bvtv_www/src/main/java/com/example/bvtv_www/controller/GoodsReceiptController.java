package com.example.bvtv_www.controller;

import com.example.bvtv_www.entity.GoodsReceipt;
import com.example.bvtv_www.enums.DocumentStatus;
import com.example.bvtv_www.service.GoodsReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API Controller cho Phiếu Nhập Hàng (PNH)
 */
@RestController
@RequestMapping("/api/goods-receipts")
@RequiredArgsConstructor
public class GoodsReceiptController {
    
    private final GoodsReceiptService goodsReceiptService;

    @GetMapping
    public ResponseEntity<List<GoodsReceipt>> getAll() {
        return ResponseEntity.ok(goodsReceiptService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoodsReceipt> getById(@PathVariable Long id) {
        return ResponseEntity.ok(goodsReceiptService.findById(id));
    }

    @GetMapping("/receipt-no/{receiptNo}")
    public ResponseEntity<GoodsReceipt> getByReceiptNo(@PathVariable String receiptNo) {
        return ResponseEntity.ok(goodsReceiptService.findByReceiptNo(receiptNo));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<GoodsReceipt>> getByStatus(@PathVariable DocumentStatus status) {
        return ResponseEntity.ok(goodsReceiptService.findByStatus(status));
    }

    @PostMapping
    public ResponseEntity<GoodsReceipt> create(@RequestBody GoodsReceipt goodsReceipt) {
        return ResponseEntity.ok(goodsReceiptService.create(goodsReceipt));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoodsReceipt> update(@PathVariable Long id, @RequestBody GoodsReceipt goodsReceipt) {
        return ResponseEntity.ok(goodsReceiptService.update(id, goodsReceipt));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<GoodsReceipt> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(goodsReceiptService.confirm(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<GoodsReceipt> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(goodsReceiptService.cancel(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        goodsReceiptService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
