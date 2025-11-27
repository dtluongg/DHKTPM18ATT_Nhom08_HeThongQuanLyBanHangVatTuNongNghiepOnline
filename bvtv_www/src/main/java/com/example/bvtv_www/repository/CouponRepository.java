package com.example.bvtv_www.repository;

import com.example.bvtv_www.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    List<Coupon> findByIsActive(Boolean isActive);
    java.util.Optional<Coupon> findByCodeIgnoreCase(String code);
}
