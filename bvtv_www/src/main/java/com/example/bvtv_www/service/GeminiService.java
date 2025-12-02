package com.example.bvtv_www.service;

import com.example.bvtv_www.entity.Category;
import com.example.bvtv_www.entity.ProductUnit;
import com.example.bvtv_www.repository.CategoryRepository;
import com.example.bvtv_www.repository.ProductUnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Autowired
    private ProductUnitRepository productUnitRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

    private static final String BASE_SYSTEM_PROMPT = "Bạn là trợ lý AI của \"Đại Lý Sáu Hiệp\" - một cửa hàng chuyên bán vật tư nông nghiệp (thuốc bảo vệ thực vật, phân bón, hạt giống...).\n" +
            "Nhiệm vụ của bạn là hỗ trợ khách hàng trả lời các câu hỏi về sản phẩm, cách sử dụng, và thông tin cửa hàng.\n" +
            "\n" +
            "Thông tin cửa hàng:\n" +
            "- Tên: Đại Lý Sáu Hiệp\n" +
            "- Địa chỉ: Ấp Sóc Ruộng, xã Ngũ Lạc, huyện Duyên Hải, tỉnh Trà Vinh.\n" +
            "- SĐT: 0363636363\n" +
            "- Email: lienhe@sauhiep.vn\n" +
            "- Giờ làm việc: 7:00 - 17:00 hàng ngày.\n" +
            "\n" +
            "Phong cách trả lời:\n" +
            "- Thân thiện, nhiệt tình, chuyên nghiệp.\n" +
            "- Dùng tiếng Việt tự nhiên.\n" +
            "- Dựa vào thông tin sản phẩm được cung cấp dưới đây để trả lời khách hàng. Nếu khách hỏi về sản phẩm không có trong danh sách, hãy nói khéo là cửa hàng hiện chưa có và mời họ liên hệ hotline.\n" +
            "- Ngắn gọn, súc tích, không trả lời quá dài dòng trừ khi cần thiết.\n" +
            "\n" +
            "DỮ LIỆU CỬA HÀNG (Sử dụng thông tin này để trả lời):\n";

    private String buildContext() {
        StringBuilder context = new StringBuilder();

        // 1. Categories
        List<Category> categories = categoryRepository.findByIsActive(true);
        if (!categories.isEmpty()) {
            context.append("Danh mục sản phẩm:\n");
            for (Category cat : categories) {
                context.append("- ").append(cat.getName()).append("\n");
            }
            context.append("\n");
        }

        // 2. Products
        List<ProductUnit> products = productUnitRepository.findByIsActiveAndIsSelling(true, true);
        if (!products.isEmpty()) {
            context.append("Danh sách sản phẩm đang bán:\n");
            for (ProductUnit p : products) {
                String status = p.getStock() > 0 ? "Còn hàng" : "Hết hàng";
                context.append(String.format("- %s (%s): Giá %s VND. %s. Tình trạng: %s\n",
                        p.getName(),
                        p.getBrandName() != null ? p.getBrandName() : "N/A",
                        p.getPrice(),
                        p.getDescription() != null ? p.getDescription().substring(0, Math.min(p.getDescription().length(), 100)).replace("\n", " ") + "..." : "",
                        status));
            }
        } else {
            context.append("Hiện chưa có sản phẩm nào đang bán.\n");
        }

        return context.toString();
    }

    public String getChatResponse(String userMessage) {
        String url = GEMINI_URL + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        
        // Build dynamic system prompt with latest DB data
        String dynamicSystemPrompt = BASE_SYSTEM_PROMPT + buildContext();
        
        String fullMessage = dynamicSystemPrompt + "\n\nKhách hàng hỏi: " + userMessage;

        Map<String, String> part = new HashMap<>();
        part.put("text", fullMessage);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(part));

        requestBody.put("contents", Collections.singletonList(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentRes = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentRes.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "Xin lỗi, tôi không thể trả lời ngay lúc này.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Có lỗi xảy ra khi kết nối với AI: " + e.getMessage();
        }
    }
}
