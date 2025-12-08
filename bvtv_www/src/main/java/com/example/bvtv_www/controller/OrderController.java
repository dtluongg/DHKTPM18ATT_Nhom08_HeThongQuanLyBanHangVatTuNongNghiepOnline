package com.example.bvtv_www.controller;

import com.example.bvtv_www.entity.Order;
import com.example.bvtv_www.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<Order>> getAll() {
        return ResponseEntity.ok(orderService.findAll());
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders() {
        return ResponseEntity.ok(orderService.findMyOrders());
    }

    @GetMapping("/by-customer/{customerId}")
    public ResponseEntity<List<Order>> getByCustomer(@PathVariable java.util.UUID customerId) {
        return ResponseEntity.ok(orderService.findByCustomerId(customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.findById(id));
    }

    @GetMapping("/lookup/{orderNo}")
    public ResponseEntity<Order> getByOrderNo(@PathVariable String orderNo) {
        return ResponseEntity.ok(orderService.findByOrderNo(orderNo));
    }

    @PostMapping
    public ResponseEntity<Order> create(@RequestBody Order order) {
        return ResponseEntity.ok(orderService.create(order));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> update(@PathVariable Long id, @RequestBody Order order) {
        return ResponseEntity.ok(orderService.update(id, order));
    }
}
