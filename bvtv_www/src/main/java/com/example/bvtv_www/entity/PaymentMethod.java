package com.example.bvtv_www.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "payment_methods")
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "for_online", nullable = false)
    private Boolean forOnline = true;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
