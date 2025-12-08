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
 * Phiếu Trả Hàng của Khách (PTH)
 * Ghi nhận việc khách hàng trả hàng và nhập lại vào kho
 */
@Data
@Entity
@Table(name = "customer_returns")
public class CustomerReturn {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "return_no", unique = true, nullable = false, length = 30, insertable = false, updatable = false)
    private String returnNo;  // PTH-YYYYMMDD-XXXX

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Order order;  // Trả từ đơn hàng nào

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Profile customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;  // Nhập lại vào kho nào

    @Column(name = "total_refund", nullable = false)
    private BigDecimal totalRefund = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String reason;  // Lý do trả hàng

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DocumentStatus status = DocumentStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Profile approvedBy;  // Người duyệt

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Profile createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "customerReturn", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<CustomerReturnItem> items = new ArrayList<>();

    public void addItem(CustomerReturnItem item) {
        items.add(item);
        item.setCustomerReturn(this);
    }

    public void removeItem(CustomerReturnItem item) {
        items.remove(item);
        item.setCustomerReturn(null);
    }

    public void calculateTotalRefund() {
        this.totalRefund = items.stream()
                .map(CustomerReturnItem::getRefundAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
