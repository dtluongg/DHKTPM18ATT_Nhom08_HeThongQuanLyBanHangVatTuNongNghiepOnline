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

    @org.springframework.data.jpa.repository.Query(value = "SELECT CAST(created_at AS DATE) as date, SUM(total_pay) as revenue FROM orders WHERE status != 'CANCELLED' AND created_at >= :startDate GROUP BY CAST(created_at AS DATE) ORDER BY date", nativeQuery = true)
    List<Object[]> getDailyRevenue(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    @org.springframework.data.jpa.repository.Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();

    @org.springframework.data.jpa.repository.Query(value = "SELECT p.name, SUM(oi.quantity) as total_sold FROM order_items oi JOIN product_units p ON oi.product_unit_id = p.id JOIN orders o ON oi.order_id = o.id WHERE o.status != 'CANCELLED' GROUP BY p.name ORDER BY total_sold DESC LIMIT 5", nativeQuery = true)
    List<Object[]> getTopSellingProducts();
}
