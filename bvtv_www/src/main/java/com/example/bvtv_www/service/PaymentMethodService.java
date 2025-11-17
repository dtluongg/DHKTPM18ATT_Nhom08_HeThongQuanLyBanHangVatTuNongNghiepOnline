package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.PaymentMethod;
import com.example.bvtv_www.repository.PaymentMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentMethodService {
    private final PaymentMethodRepository paymentMethodRepository;

    public List<PaymentMethod> findAll() {
        return paymentMethodRepository.findAll();
    }

    public List<PaymentMethod> findOnlinePaymentMethods() {
        return paymentMethodRepository.findByForOnlineAndIsActive(true, true);
    }

    public PaymentMethod findById(Long id) {
        return paymentMethodRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment method not found"));
    }

    public PaymentMethod create(PaymentMethod paymentMethod) {
        return paymentMethodRepository.save(paymentMethod);
    }
}
