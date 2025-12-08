package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.GoodsReceipt;
import com.example.bvtv_www.entity.GoodsReceiptItem;
import com.example.bvtv_www.entity.Profile;
import com.example.bvtv_www.enums.DocumentStatus;
import com.example.bvtv_www.repository.GoodsReceiptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service cho Phiếu Nhập Hàng (PNH)
 */
@Service
@RequiredArgsConstructor
public class GoodsReceiptService {
    
    private final GoodsReceiptRepository goodsReceiptRepository;
    private final ProfileService profileService;

    public List<GoodsReceipt> findAll() {
        return goodsReceiptRepository.findAll();
    }

    public GoodsReceipt findById(Long id) {
        return goodsReceiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goods Receipt not found with id: " + id));
    }

    public GoodsReceipt findByReceiptNo(String receiptNo) {
        return goodsReceiptRepository.findByReceiptNo(receiptNo)
                .orElseThrow(() -> new RuntimeException("Goods Receipt not found with no: " + receiptNo));
    }

    public List<GoodsReceipt> findByStatus(DocumentStatus status) {
        return goodsReceiptRepository.findByStatus(status);
    }

    @Transactional
    public GoodsReceipt create(GoodsReceipt goodsReceipt) {
        // receiptNo sẽ được tự động generate bởi trigger trong DB
        goodsReceipt.setStatus(DocumentStatus.DRAFT);
        
        // Gắn createdBy từ user đang đăng nhập
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() &&
                !"anonymousUser".equals(authentication.getPrincipal())) {
            String email = authentication.getName();
            try {
                Profile creator = profileService.findByEmail(email);
                goodsReceipt.setCreatedBy(creator);
            } catch (RuntimeException ex) {
                // Nếu không tìm thấy profile, tiếp tục không có createdBy
            }
        }
        
        // Gắn relationship cho items
        if (goodsReceipt.getItems() != null) {
            for (GoodsReceiptItem item : goodsReceipt.getItems()) {
                item.setReceipt(goodsReceipt);
            }
        }
        
        // Tính tổng tiền
        goodsReceipt.calculateTotalAmount();
        
        GoodsReceipt saved = goodsReceiptRepository.save(goodsReceipt);
        goodsReceiptRepository.flush();
        
        // Refresh để lấy receiptNo được generate bởi trigger
        return goodsReceiptRepository.findById(saved.getId()).orElse(saved);
    }

    @Transactional
    public GoodsReceipt update(Long id, GoodsReceipt updatedReceipt) {
        GoodsReceipt existing = findById(id);
        
        // Chỉ cho phép cập nhật khi status = DRAFT
        if (existing.getStatus() != DocumentStatus.DRAFT) {
            throw new RuntimeException("Cannot update goods receipt with status: " + existing.getStatus());
        }
        
        existing.setSupplier(updatedReceipt.getSupplier());
        existing.setWarehouse(updatedReceipt.getWarehouse());
        existing.setNotes(updatedReceipt.getNotes());
        existing.setPaymentStatus(updatedReceipt.getPaymentStatus());
        
        // Cập nhật items
        existing.getItems().clear();
        if (updatedReceipt.getItems() != null) {
            for (GoodsReceiptItem item : updatedReceipt.getItems()) {
                existing.addItem(item);
            }
        }
        
        existing.calculateTotalAmount();
        
        return goodsReceiptRepository.save(existing);
    }

    /**
     * Xác nhận phiếu nhập hàng - chuyển sang CONFIRMED
     * Trigger UPDATE trong DB (V16) sẽ tự động tạo inventory_movements cho tất cả items
     */
    @Transactional
    public GoodsReceipt confirm(Long id) {
        GoodsReceipt receipt = findById(id);
        
        if (receipt.getStatus() != DocumentStatus.DRAFT) {
            throw new RuntimeException("Can only confirm DRAFT receipts");
        }
        
        receipt.setStatus(DocumentStatus.CONFIRMED);
        return goodsReceiptRepository.save(receipt);
    }

    /**
     * Hủy phiếu nhập hàng
     */
    @Transactional
    public GoodsReceipt cancel(Long id) {
        GoodsReceipt receipt = findById(id);
        
        if (receipt.getStatus() == DocumentStatus.CONFIRMED) {
            throw new RuntimeException("Cannot cancel confirmed receipts");
        }
        
        receipt.setStatus(DocumentStatus.CANCELLED);
        return goodsReceiptRepository.save(receipt);
    }

    @Transactional
    public void delete(Long id) {
        GoodsReceipt receipt = findById(id);
        
        // Chỉ cho phép xóa phiếu DRAFT hoặc CANCELLED
        if (receipt.getStatus() != DocumentStatus.DRAFT && 
            receipt.getStatus() != DocumentStatus.CANCELLED) {
            throw new RuntimeException("Can only delete DRAFT or CANCELLED receipts");
        }
        
        goodsReceiptRepository.delete(receipt);
    }
}
