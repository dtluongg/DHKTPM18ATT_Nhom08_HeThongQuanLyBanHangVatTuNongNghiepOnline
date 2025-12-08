package com.example.bvtv_www.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Chi tiết Phiếu Nhập Hàng
 */
@Data
@Entity
@Table(name = "goods_receipt_items")
public class GoodsReceiptItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id", nullable = false)
    @JsonBackReference
    private GoodsReceipt receipt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_unit_id", nullable = false)
    private ProductUnit productUnit;

    @Column(nullable = false)
    private Integer quantity;  // Số lượng nhập

    @Column(name = "unit_cost", nullable = false)
    private BigDecimal unitCost;  // Giá nhập/đơn vị

    // line_total được tính bằng quantity * unit_cost (computed column trong DB)
    // Không cần field ở đây, có thể tính runtime nếu cần

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Tính thành tiền
     */
    public BigDecimal getLineTotal() {
        if (quantity == null || unitCost == null) {
            return BigDecimal.ZERO;
        }
        return unitCost.multiply(BigDecimal.valueOf(quantity));
    }
}
