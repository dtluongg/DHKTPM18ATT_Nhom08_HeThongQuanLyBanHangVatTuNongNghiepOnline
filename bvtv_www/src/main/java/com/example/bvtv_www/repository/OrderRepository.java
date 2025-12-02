package com.example.bvtv_www.repository;

import com.example.bvtv_www.entity.Order;
import com.example.bvtv_www.entity.Profile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyer(Profile buyer);
    Optional<Order> findByOrderNo(String orderNo);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.status != 'CANCELLED'")
    long countTotalOrders();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalPay) FROM Order o WHERE o.status != 'CANCELLED'")
    java.math.BigDecimal sumTotalRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'PENDING'")
    long countPendingOrders();
}
