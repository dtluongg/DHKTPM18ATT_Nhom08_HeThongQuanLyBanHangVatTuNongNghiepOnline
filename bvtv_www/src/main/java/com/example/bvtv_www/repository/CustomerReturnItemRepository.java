package com.example.bvtv_www.repository;

import com.example.bvtv_www.entity.CustomerReturnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerReturnItemRepository extends JpaRepository<CustomerReturnItem, Long> {
}
