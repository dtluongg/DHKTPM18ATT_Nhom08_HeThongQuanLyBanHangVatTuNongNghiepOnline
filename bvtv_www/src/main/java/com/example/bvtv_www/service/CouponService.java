package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.Coupon;
import com.example.bvtv_www.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {
    private final CouponRepository couponRepository;

    public List<Coupon> findAll() {
        // Chỉ lấy mã giảm giá isActive = true (chưa xóa mềm)
        return couponRepository.findByIsActive(true);
    }

    public Coupon findById(Long id) {
        return couponRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Coupon not found"));
    }

    public Coupon create(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    public java.util.Optional<Coupon> findByCode(String code) {
        return couponRepository.findByCodeIgnoreCase(code);
    }

    public Coupon findByIdOrThrow(Long id) {
        return couponRepository.findById(id).orElseThrow(() -> new RuntimeException("Coupon not found"));
    }

    public Coupon decrementUsageIfLimited(Coupon coupon) {
        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0) {
            coupon.setUsageLimit(coupon.getUsageLimit() - 1);
            return couponRepository.save(coupon);
        }
        return coupon;
    }
}
