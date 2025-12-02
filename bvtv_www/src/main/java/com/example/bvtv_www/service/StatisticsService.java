package com.example.bvtv_www.service;

import com.example.bvtv_www.repository.OrderRepository;
import com.example.bvtv_www.repository.ProductUnitRepository;
import com.example.bvtv_www.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final OrderRepository orderRepository;
    private final ProductUnitRepository productUnitRepository;
    private final ProfileRepository profileRepository;

    public Map<String, Object> getSummaryStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalOrders = orderRepository.countTotalOrders();
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }
        long pendingOrders = orderRepository.countPendingOrders();
        long totalProducts = productUnitRepository.count();
        long totalCustomers = profileRepository.count(); // Assuming all profiles are customers for now, or filter by role if needed

        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("pendingOrders", pendingOrders);
        stats.put("totalProducts", totalProducts);
        stats.put("totalCustomers", totalCustomers);

        return stats;
    }
}
