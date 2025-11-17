package com.example.bvtv_www.repository;

import com.example.bvtv_www.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByForOnlineAndIsActive(Boolean forOnline, Boolean isActive);
}
