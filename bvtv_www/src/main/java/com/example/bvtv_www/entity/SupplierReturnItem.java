package com.example.bvtv_www.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Chi tiết Phiếu Trả Hàng NCC
 */
@Data
@Entity
@Table(name = "supplier_return_items")
public class SupplierReturnItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_id", nullable = false)
    @JsonBackReference
    private SupplierReturn supplierReturn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_item_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private GoodsReceiptItem receiptItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_unit_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ProductUnit productUnit;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "return_amount", nullable = false)
    private BigDecimal returnAmount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
