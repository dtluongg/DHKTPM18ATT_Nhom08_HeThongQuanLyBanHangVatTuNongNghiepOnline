package com.example.bvtv_www.repository;

import com.example.bvtv_www.entity.GoodsReceipt;
import com.example.bvtv_www.entity.Profile;
import com.example.bvtv_www.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoodsReceiptRepository extends JpaRepository<GoodsReceipt, Long> {
    Optional<GoodsReceipt> findByReceiptNo(String receiptNo);
    List<GoodsReceipt> findByStatus(DocumentStatus status);
    List<GoodsReceipt> findBySupplier(Profile supplier);
}
