package com.example.bvtv_www.repository;

import com.example.bvtv_www.entity.ProductUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductUnitRepository extends JpaRepository<ProductUnit, Long> {
    List<ProductUnit> findByIsActive(Boolean isActive);
    List<ProductUnit> findByIsActiveAndIsSelling(Boolean isActive, Boolean isSelling);
}
