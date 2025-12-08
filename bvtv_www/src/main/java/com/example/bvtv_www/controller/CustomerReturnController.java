package com.example.bvtv_www.controller;

import com.example.bvtv_www.entity.CustomerReturn;
import com.example.bvtv_www.enums.DocumentStatus;
import com.example.bvtv_www.service.CustomerReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API Controller cho Phiếu Trả Hàng Khách (PTH)
 */
@RestController
@RequestMapping("/api/customer-returns")
@RequiredArgsConstructor
public class CustomerReturnController {
    
    private final CustomerReturnService customerReturnService;

    @GetMapping
    public ResponseEntity<List<CustomerReturn>> getAll() {
        return ResponseEntity.ok(customerReturnService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerReturn> getById(@PathVariable Long id) {
        return ResponseEntity.ok(customerReturnService.findById(id));
    }

    @GetMapping("/return-no/{returnNo}")
    public ResponseEntity<CustomerReturn> getByReturnNo(@PathVariable String returnNo) {
        return ResponseEntity.ok(customerReturnService.findByReturnNo(returnNo));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CustomerReturn>> getByStatus(@PathVariable DocumentStatus status) {
        return ResponseEntity.ok(customerReturnService.findByStatus(status));
    }

    @PostMapping
    public ResponseEntity<CustomerReturn> create(@RequestBody CustomerReturn customerReturn) {
        return ResponseEntity.ok(customerReturnService.create(customerReturn));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerReturn> update(@PathVariable Long id, @RequestBody CustomerReturn customerReturn) {
        return ResponseEntity.ok(customerReturnService.update(id, customerReturn));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<CustomerReturn> approve(@PathVariable Long id) {
        return ResponseEntity.ok(customerReturnService.approve(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<CustomerReturn> reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        return ResponseEntity.ok(customerReturnService.reject(id, reason));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<CustomerReturn> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(customerReturnService.cancel(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customerReturnService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
