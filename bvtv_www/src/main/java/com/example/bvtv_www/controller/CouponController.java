package com.example.bvtv_www.controller;

import com.example.bvtv_www.entity.Coupon;
import com.example.bvtv_www.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<List<Coupon>> getAll() {
        return ResponseEntity.ok(couponService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Coupon> getById(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Coupon> create(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.create(coupon));
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<java.util.Map<String, Object>> validate(
            @PathVariable String code,
            @RequestParam(required = false) java.math.BigDecimal amount
    ) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        var opt = couponService.findByCode(code);
        if (opt.isEmpty()) {
            result.put("valid", false);
            result.put("message", "Mã giảm giá không tồn tại");
            return ResponseEntity.ok(result);
        }

        var coupon = opt.get();
        // basic active check
        if (coupon.getIsActive() == null || !coupon.getIsActive()) {
            result.put("valid", false);
            result.put("message", "Mã giảm giá không còn hiệu lực");
            return ResponseEntity.ok(result);
        }

        java.time.LocalDate today = java.time.LocalDate.now();
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(today)) {
            result.put("valid", false);
            result.put("message", "Mã giảm giá đã hết hạn");
            return ResponseEntity.ok(result);
        }

        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() <= 0) {
            result.put("valid", false);
            result.put("message", "Mã giảm giá đã đạt giới hạn sử dụng");
            return ResponseEntity.ok(result);
        }

        if (amount != null && coupon.getMinOrderTotal() != null) {
            if (amount.compareTo(coupon.getMinOrderTotal()) < 0) {
                result.put("valid", false);
                result.put("message", "Đơn hàng chưa đủ điều kiện áp dụng mã giảm giá");
                result.put("minOrderTotal", coupon.getMinOrderTotal());
                return ResponseEntity.ok(result);
            }
        }

        // compute discount amount (if amount provided)
        java.math.BigDecimal discountAmount = java.math.BigDecimal.ZERO;
        if (amount != null && coupon.getDiscountValue() != null) {
            try {
                if ("percent".equalsIgnoreCase(coupon.getDiscountType())) {
                    discountAmount = amount.multiply(coupon.getDiscountValue()).divide(new java.math.BigDecimal(100));
                } else { // fixed
                    discountAmount = coupon.getDiscountValue();
                }
            } catch (Exception e) {
                discountAmount = java.math.BigDecimal.ZERO;
            }
        }

        result.put("valid", true);
        result.put("message", "Áp dụng thành công");
        result.put("discountAmount", discountAmount);
        result.put("coupon", coupon);
        return ResponseEntity.ok(result);
    }
}
