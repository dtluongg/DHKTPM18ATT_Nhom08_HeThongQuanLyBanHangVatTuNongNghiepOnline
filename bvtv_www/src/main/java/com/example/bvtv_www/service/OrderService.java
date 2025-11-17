package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.Order;
import com.example.bvtv_www.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Order findById(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order create(Order order) {
        return orderRepository.save(order);
    }

    public Order update(Long id, Order order) {
        Order existing = findById(id);
        // Chỉ cho phép cập nhật trạng thái và ghi chú
        existing.setStatus(order.getStatus());
        if (order.getNotes() != null) {
            existing.setNotes(order.getNotes());
        }
        return orderRepository.save(existing);
    }
}
