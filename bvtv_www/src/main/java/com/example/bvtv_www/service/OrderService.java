package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.Order;
import com.example.bvtv_www.entity.Profile;
import com.example.bvtv_www.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import jakarta.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProfileService profileService;
    private final EntityManager entityManager;
    private final CouponService couponService;

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order findByOrderNo(String orderNo) {
        return orderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional
    public Order create(Order order) {
        // If user is authenticated, attach the buyer (Profile) automatically
        // so frontend doesn't need to provide buyer info when logged in.
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() &&
                !"anonymousUser".equals(authentication.getPrincipal())) {
            String email = authentication.getName();
            try {
                Profile buyer = profileService.findByEmail(email);
                order.setBuyer(buyer);
            } catch (RuntimeException ex) {
                // If profile not found, proceed without buyer (should be unusual)
            }
        }
        // Server-side: validate and compute coupon discount if present.
        if (order.getCoupon() != null && order.getCoupon().getId() != null) {
            try {
                var coupon = couponService.findByIdOrThrow(order.getCoupon().getId());
                // basic checks
                if (coupon.getIsActive() == null || !coupon.getIsActive()) {
                    throw new RuntimeException("Coupon is not active");
                }
                java.time.LocalDate today = java.time.LocalDate.now();
                if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(today)) {
                    throw new RuntimeException("Coupon expired");
                }
                if (coupon.getUsageLimit() != null && coupon.getUsageLimit() <= 0) {
                    throw new RuntimeException("Coupon usage limit reached");
                }
                if (coupon.getMinOrderTotal() != null && order.getTotalAmount() != null) {
                    if (order.getTotalAmount().compareTo(coupon.getMinOrderTotal()) < 0) {
                        throw new RuntimeException("Order total does not meet coupon minimum");
                    }
                }

                // compute discount
                java.math.BigDecimal discount = java.math.BigDecimal.ZERO;
                if (order.getTotalAmount() != null && coupon.getDiscountValue() != null) {
                    if ("percent".equalsIgnoreCase(coupon.getDiscountType())) {
                        discount = order.getTotalAmount().multiply(coupon.getDiscountValue())
                                .divide(new java.math.BigDecimal(100));
                    } else { // fixed
                        discount = coupon.getDiscountValue();
                    }
                    // never exceed total
                    if (discount.compareTo(order.getTotalAmount()) > 0) {
                        discount = order.getTotalAmount();
                    }
                }

                order.setDiscountTotal(discount);
                order.setCoupon(coupon);
                // compute totalPay = totalAmount - discount
                try {
                    java.math.BigDecimal total = order.getTotalAmount() != null ? order.getTotalAmount()
                            : java.math.BigDecimal.ZERO;
                    java.math.BigDecimal disc = order.getDiscountTotal() != null ? order.getDiscountTotal()
                            : java.math.BigDecimal.ZERO;
                    order.setTotalPay(total.subtract(disc));
                } catch (Exception ex) {
                    order.setTotalPay(order.getTotalAmount());
                }
            } catch (RuntimeException ex) {
                throw new RuntimeException("Coupon validation failed: " + ex.getMessage());
            }
        }

        // ensure discountTotal is not null and totalPay is set when no coupon
        if (order.getDiscountTotal() == null) {
            order.setDiscountTotal(java.math.BigDecimal.ZERO);
        }
        if (order.getTotalPay() == null) {
            try {
                java.math.BigDecimal total = order.getTotalAmount() != null ? order.getTotalAmount()
                        : java.math.BigDecimal.ZERO;
                java.math.BigDecimal disc = order.getDiscountTotal() != null ? order.getDiscountTotal()
                        : java.math.BigDecimal.ZERO;
                order.setTotalPay(total.subtract(disc));
            } catch (Exception ex) {
                order.setTotalPay(order.getTotalAmount());
            }
        }

        // Force INSERT and immediately refresh the managed entity so that
        // values generated by DB triggers/defaults (like orderNo) are populated
        // into the returned object. Using refresh avoids returning a cached
        // instance without the DB-generated values.
        Order saved = orderRepository.saveAndFlush(order);
        entityManager.refresh(saved);

        // If coupon was applied, decrement usageLimit (if any)
        if (saved.getCoupon() != null && saved.getCoupon().getId() != null) {
            try {
                couponService.decrementUsageIfLimited(saved.getCoupon());
            } catch (Exception e) {
                // log but do not rollback order creation because coupon usage decrement failed
            }
        }

        return saved;
    }

    public Order update(Long id, Order order) {
        Order existing = findById(id);
        // Chỉ cho phép cập nhật trạng thái và ghi chú
        existing.setStatus(order.getStatus());
        if (order.getNotes() != null) {
            existing.setNotes(order.getNotes());
        }
        return orderRepository.save(existing);
    }

    public List<Order> findMyOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        String email = authentication.getName(); // email of the user
        Profile buyer = profileService.findByEmail(email);
        return orderRepository.findByBuyer(buyer);
    }

    public List<Order> findByCustomerId(java.util.UUID customerId) {
        Profile customer = profileService.findById(customerId);
        return orderRepository.findByBuyer(customer);
    }
}
