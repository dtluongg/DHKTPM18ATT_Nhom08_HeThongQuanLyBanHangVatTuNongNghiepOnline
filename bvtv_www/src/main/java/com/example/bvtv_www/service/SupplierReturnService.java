package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.Profile;
import com.example.bvtv_www.entity.SupplierReturn;
import com.example.bvtv_www.entity.SupplierReturnItem;
import com.example.bvtv_www.enums.DocumentStatus;
import com.example.bvtv_www.repository.SupplierReturnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierReturnService {
    
    private final SupplierReturnRepository supplierReturnRepository;
    private final ProfileService profileService;

    public List<SupplierReturn> findAll() {
        return supplierReturnRepository.findAll();
    }

    public SupplierReturn findById(Long id) {
        return supplierReturnRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier Return not found with id: " + id));
    }

    public SupplierReturn findByReturnNo(String returnNo) {
        return supplierReturnRepository.findByReturnNo(returnNo)
                .orElseThrow(() -> new RuntimeException("Supplier Return not found with no: " + returnNo));
    }

    public List<SupplierReturn> findByStatus(DocumentStatus status) {
        return supplierReturnRepository.findByStatus(status);
    }

    @Transactional
    public SupplierReturn create(SupplierReturn supplierReturn) {
        supplierReturn.setStatus(DocumentStatus.PENDING);
        
        // Gắn createdBy từ user đang đăng nhập
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() &&
                !"anonymousUser".equals(authentication.getPrincipal())) {
            String email = authentication.getName();
            try {
                Profile creator = profileService.findByEmail(email);
                supplierReturn.setCreatedBy(creator);
            } catch (RuntimeException ex) {
                // Nếu không tìm thấy profile, tiếp tục không có createdBy
            }
        }
        
        if (supplierReturn.getItems() != null) {
            for (SupplierReturnItem item : supplierReturn.getItems()) {
                item.setSupplierReturn(supplierReturn);
            }
        }
        
        supplierReturn.calculateTotalReturn();
        
        SupplierReturn saved = supplierReturnRepository.save(supplierReturn);
        supplierReturnRepository.flush();
        
        // Refresh để lấy returnNo được generate bởi trigger
        return supplierReturnRepository.findById(saved.getId()).orElse(saved);
    }

    @Transactional
    public SupplierReturn update(Long id, SupplierReturn updatedReturn) {
        SupplierReturn existing = findById(id);
        
        if (existing.getStatus() != DocumentStatus.PENDING) {
            throw new RuntimeException("Cannot update supplier return with status: " + existing.getStatus());
        }
        
        existing.setReceipt(updatedReturn.getReceipt());
        existing.setSupplier(updatedReturn.getSupplier());
        existing.setWarehouse(updatedReturn.getWarehouse());
        existing.setReason(updatedReturn.getReason());
        
        existing.getItems().clear();
        if (updatedReturn.getItems() != null) {
            for (SupplierReturnItem item : updatedReturn.getItems()) {
                existing.addItem(item);
            }
        }
        
        existing.calculateTotalReturn();
        return supplierReturnRepository.save(existing);
    }

    @Transactional
    public SupplierReturn approve(Long id) {
        SupplierReturn supplierReturn = findById(id);
        
        if (supplierReturn.getStatus() != DocumentStatus.PENDING) {
            throw new RuntimeException("Can only approve PENDING returns");
        }
        
        // Gắn approvedBy từ user đang đăng nhập
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() &&
                !"anonymousUser".equals(authentication.getPrincipal())) {
            String email = authentication.getName();
            try {
                Profile approver = profileService.findByEmail(email);
                supplierReturn.setApprovedBy(approver);
            } catch (RuntimeException ex) {
                // Nếu không tìm thấy profile, tiếp tục không có approvedBy
            }
        }
        
        supplierReturn.setStatus(DocumentStatus.APPROVED);
        return supplierReturnRepository.save(supplierReturn);
    }

    @Transactional
    public SupplierReturn reject(Long id, String reason) {
        SupplierReturn supplierReturn = findById(id);
        
        if (supplierReturn.getStatus() != DocumentStatus.PENDING) {
            throw new RuntimeException("Can only reject PENDING returns");
        }
        
        supplierReturn.setStatus(DocumentStatus.REJECTED);
        supplierReturn.setReason(reason);
        return supplierReturnRepository.save(supplierReturn);
    }

    @Transactional
    public SupplierReturn cancel(Long id) {
        SupplierReturn supplierReturn = findById(id);
        
        if (supplierReturn.getStatus() == DocumentStatus.APPROVED) {
            throw new RuntimeException("Cannot cancel approved returns");
        }
        
        supplierReturn.setStatus(DocumentStatus.CANCELLED);
        return supplierReturnRepository.save(supplierReturn);
    }

    @Transactional
    public void delete(Long id) {
        SupplierReturn supplierReturn = findById(id);
        
        if (supplierReturn.getStatus() == DocumentStatus.APPROVED) {
            throw new RuntimeException("Cannot delete approved returns");
        }
        
        supplierReturnRepository.delete(supplierReturn);
    }
}
