package com.example.bvtv_www.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Chi tiết Phiếu Trả Hàng Khách
 */
@Data
@Entity
@Table(name = "customer_return_items")
public class CustomerReturnItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_id", nullable = false)
    @JsonBackReference
    private CustomerReturn customerReturn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private OrderItem orderItem;  // Item nào được trả

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_unit_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ProductUnit productUnit;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "refund_amount", nullable = false)
    private BigDecimal refundAmount;  // Tiền hoàn

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
