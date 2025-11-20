package com.example.bvtv_www.entity;

import com.example.bvtv_www.enums.OrderStatus;
import com.example.bvtv_www.enums.PaymentTerm;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", unique = true, length = 30)
    private String orderNo;

    @ManyToOne
    @JoinColumn(name = "buyer_id")
    private Profile buyer;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "total_vat", nullable = false)
    private BigDecimal totalVat = BigDecimal.ZERO;

    @Column(name = "discount_total", nullable = false)
    private BigDecimal discountTotal = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR")
    private OrderStatus status = OrderStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "payment_method_id")
    private PaymentMethod paymentMethod;

    @ManyToOne
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_term", nullable = false, columnDefinition = "VARCHAR")
    private PaymentTerm paymentTerm = PaymentTerm.PREPAID;

    @Column(name = "is_online", nullable = false)
    private Boolean isOnline = true;

    @Column(name = "einvoice_required", nullable = false)
    private Boolean einvoiceRequired = false;

    // Thông tin giao hàng (cho Guest order)
    @Column(name = "delivery_name")
    private String deliveryName;

    @Column(name = "delivery_phone", length = 20)
    private String deliveryPhone;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Ngăn vòng lặp vô hạn khi serialize JSON
    private List<OrderItem> items = new ArrayList<>();
}
