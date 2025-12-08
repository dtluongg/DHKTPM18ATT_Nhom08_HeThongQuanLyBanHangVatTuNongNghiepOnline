package com.example.bvtv_www.repository;

import com.example.bvtv_www.entity.SupplierReturn;
import com.example.bvtv_www.entity.Profile;
import com.example.bvtv_www.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierReturnRepository extends JpaRepository<SupplierReturn, Long> {
    Optional<SupplierReturn> findByReturnNo(String returnNo);
    List<SupplierReturn> findByStatus(DocumentStatus status);
    List<SupplierReturn> findBySupplier(Profile supplier);
}
