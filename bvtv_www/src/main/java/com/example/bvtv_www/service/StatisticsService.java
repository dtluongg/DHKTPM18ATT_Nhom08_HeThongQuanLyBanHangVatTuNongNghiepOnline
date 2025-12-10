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
        long totalCustomers = profileRepository.count(); // Assuming all profiles are customers for now

        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("pendingOrders", pendingOrders);
        stats.put("totalProducts", totalProducts);
        stats.put("totalCustomers", totalCustomers);

        // Chart Data (Last 7 Days)
        java.util.List<Map<String, Object>> chartData = new java.util.ArrayList<>();
        java.time.LocalDateTime sevenDaysAgo = java.time.LocalDateTime.now().minusDays(6).withHour(0).withMinute(0).withSecond(0);
        java.util.List<Object[]> revenueData = orderRepository.getDailyRevenue(sevenDaysAgo);
        
        Map<String, BigDecimal> revenueMap = new HashMap<>();
        if (revenueData != null) {
            for (Object[] row : revenueData) {
                if (row[0] != null && row[1] != null) {
                    revenueMap.put(row[0].toString(), (BigDecimal) row[1]);
                }
            }
        }

        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM");
        java.time.LocalDate today = java.time.LocalDate.now();
        
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = today.minusDays(i);
            String key = date.toString(); // YYYY-MM-DD
            String label = date.format(formatter); // dd/MM
            
            Map<String, Object> dayStat = new HashMap<>();
            dayStat.put("name", label);
            dayStat.put("revenue", revenueMap.getOrDefault(key, BigDecimal.ZERO));
            chartData.add(dayStat);
        }
        stats.put("revenueChart", chartData);

        // Order Status Distribution
        java.util.List<Map<String, Object>> statusData = new java.util.ArrayList<>();
        java.util.List<Object[]> statusRaw = orderRepository.countOrdersByStatus();
        if (statusRaw != null) {
            for (Object[] row : statusRaw) {
                Map<String, Object> item = new HashMap<>();
                item.put("name", row[0].toString());
                item.put("value", row[1]);
                statusData.add(item);
            }
        }
        stats.put("orderStatusDistribution", statusData);

        // Top Selling Products
        java.util.List<Map<String, Object>> topProductsData = new java.util.ArrayList<>();
        java.util.List<Object[]> topProductsRaw = orderRepository.getTopSellingProducts();
        if (topProductsRaw != null) {
            for (Object[] row : topProductsRaw) {
                Map<String, Object> item = new HashMap<>();
                item.put("name", row[0].toString());
                item.put("sold", row[1]);
                topProductsData.add(item);
            }
        }
        stats.put("topSellingProducts", topProductsData);

        return stats;
    }
}
