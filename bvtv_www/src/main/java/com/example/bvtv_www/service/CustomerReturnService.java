package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.CustomerReturn;
import com.example.bvtv_www.entity.CustomerReturnItem;
import com.example.bvtv_www.entity.Profile;
import com.example.bvtv_www.enums.DocumentStatus;
import com.example.bvtv_www.repository.CustomerReturnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service cho Phiếu Trả Hàng Khách (PTH)
 */
@Service
@RequiredArgsConstructor
public class CustomerReturnService {
    
    private final CustomerReturnRepository customerReturnRepository;
    private final ProfileService profileService;

    public List<CustomerReturn> findAll() {
        return customerReturnRepository.findAll();
    }

    public CustomerReturn findById(Long id) {
        return customerReturnRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer Return not found with id: " + id));
    }

    public CustomerReturn findByReturnNo(String returnNo) {
        return customerReturnRepository.findByReturnNo(returnNo)
                .orElseThrow(() -> new RuntimeException("Customer Return not found with no: " + returnNo));
    }

    public List<CustomerReturn> findByStatus(DocumentStatus status) {
        return customerReturnRepository.findByStatus(status);
    }

    @Transactional
    public CustomerReturn create(CustomerReturn customerReturn) {
        customerReturn.setStatus(DocumentStatus.PENDING);
        
        // Gắn createdBy từ user đang đăng nhập
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() &&
                !"anonymousUser".equals(authentication.getPrincipal())) {
            String email = authentication.getName();
            try {
                Profile creator = profileService.findByEmail(email);
                customerReturn.setCreatedBy(creator);
            } catch (RuntimeException ex) {
                // Nếu không tìm thấy profile, tiếp tục không có createdBy
            }
        }
        
        if (customerReturn.getItems() != null) {
            for (CustomerReturnItem item : customerReturn.getItems()) {
                item.setCustomerReturn(customerReturn);
            }
        }
        
        customerReturn.calculateTotalRefund();
        
        CustomerReturn saved = customerReturnRepository.save(customerReturn);
        customerReturnRepository.flush();
        
        // Refresh để lấy returnNo được generate bởi trigger
        return customerReturnRepository.findById(saved.getId()).orElse(saved);
    }

    @Transactional
    public CustomerReturn update(Long id, CustomerReturn updatedReturn) {
        CustomerReturn existing = findById(id);
        
        if (existing.getStatus() != DocumentStatus.PENDING) {
            throw new RuntimeException("Cannot update customer return with status: " + existing.getStatus());
        }
        
        existing.setOrder(updatedReturn.getOrder());
        existing.setCustomer(updatedReturn.getCustomer());
        existing.setWarehouse(updatedReturn.getWarehouse());
        existing.setReason(updatedReturn.getReason());
        
        existing.getItems().clear();
        if (updatedReturn.getItems() != null) {
            for (CustomerReturnItem item : updatedReturn.getItems()) {
                existing.addItem(item);
            }
        }
        
        existing.calculateTotalRefund();
        
        return customerReturnRepository.save(existing);
    }

    @Transactional
    public CustomerReturn approve(Long id) {
        CustomerReturn customerReturn = findById(id);
        
        if (customerReturn.getStatus() != DocumentStatus.PENDING) {
            throw new RuntimeException("Can only approve PENDING returns");
        }
        
        customerReturn.setStatus(DocumentStatus.APPROVED);
        return customerReturnRepository.save(customerReturn);
    }

    @Transactional
    public CustomerReturn reject(Long id, String reason) {
        CustomerReturn customerReturn = findById(id);
        
        if (customerReturn.getStatus() != DocumentStatus.PENDING) {
            throw new RuntimeException("Can only reject PENDING returns");
        }
        
        customerReturn.setStatus(DocumentStatus.REJECTED);
        customerReturn.setReason(reason);
        return customerReturnRepository.save(customerReturn);
    }

    @Transactional
    public CustomerReturn cancel(Long id) {
        CustomerReturn customerReturn = findById(id);
        
        if (customerReturn.getStatus() == DocumentStatus.APPROVED) {
            throw new RuntimeException("Cannot cancel approved returns");
        }
        
        customerReturn.setStatus(DocumentStatus.CANCELLED);
        return customerReturnRepository.save(customerReturn);
    }

    @Transactional
    public void delete(Long id) {
        CustomerReturn customerReturn = findById(id);
        
        if (customerReturn.getStatus() == DocumentStatus.APPROVED) {
            throw new RuntimeException("Cannot delete approved returns");
        }
        
        customerReturnRepository.delete(customerReturn);
    }
}
