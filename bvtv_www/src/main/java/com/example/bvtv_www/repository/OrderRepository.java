package com.example.bvtv_www.repository;

import com.example.bvtv_www.entity.Order;
import com.example.bvtv_www.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyer(Profile buyer);
}
