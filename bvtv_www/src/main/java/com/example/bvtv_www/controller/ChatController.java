package com.example.bvtv_www.controller;

import com.example.bvtv_www.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> payload) {
        try {
            String userMessage = "";
            if (payload.containsKey("messages")) {
                List<Map<String, String>> messages = (List<Map<String, String>>) payload.get("messages");
                if (messages != null && !messages.isEmpty()) {
                    Map<String, String> lastMsg = messages.get(messages.size() - 1);
                    userMessage = lastMsg.get("content");
                }
            }

            if (userMessage == null || userMessage.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("content", "Vui lòng nhập nội dung tin nhắn.");
                return ResponseEntity.badRequest().body(error);
            }

            String aiResponse = geminiService.getChatResponse(userMessage);

            Map<String, String> response = new HashMap<>();
            response.put("content", aiResponse);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("content", "Server Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
