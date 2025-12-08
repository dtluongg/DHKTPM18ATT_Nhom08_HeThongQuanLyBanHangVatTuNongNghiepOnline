package com.example.bvtv_www.entity;

import com.example.bvtv_www.enums.DocumentStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Phiếu Trả Hàng cho NCC (PTHNCC)
 */
@Data
@Entity
@Table(name = "supplier_returns")
public class SupplierReturn {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "return_no", unique = true, nullable = false, length = 30, insertable = false, updatable = false)
    private String returnNo;  // PTHNCC-YYYYMMDD-XXXX

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private GoodsReceipt receipt;  // Trả từ phiếu nhập nào

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Profile supplier;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Warehouse warehouse;

    @Column(name = "total_return", nullable = false)
    private BigDecimal totalReturn = BigDecimal.ZERO;

    @Column(name = "total_vat")
    private BigDecimal totalVat = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DocumentStatus status = DocumentStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Profile approvedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Profile createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "supplierReturn", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<SupplierReturnItem> items = new ArrayList<>();

    public void addItem(SupplierReturnItem item) {
        items.add(item);
        item.setSupplierReturn(this);
    }

    public void removeItem(SupplierReturnItem item) {
        items.remove(item);
        item.setSupplierReturn(null);
    }

    public void calculateTotalReturn() {
        this.totalReturn = items.stream()
                .map(SupplierReturnItem::getReturnAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
