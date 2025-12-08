package com.example.bvtv_www.repository;

import com.example.bvtv_www.entity.SupplierReturnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierReturnItemRepository extends JpaRepository<SupplierReturnItem, Long> {
}
