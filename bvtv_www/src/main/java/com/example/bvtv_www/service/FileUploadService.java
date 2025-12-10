package com.example.bvtv_www.service;

import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucketName;

    private final OkHttpClient client = new OkHttpClient();

    /**
     * Upload file lên Supabase Storage
     * @param file File cần upload
     * @param folder Thư mục lưu trữ (vd: "product-units", "categories")
     * @param customName Tên tùy chỉnh cho file (vd: "product-1", "phan-bon-npk")
     * @return Public URL của file đã upload
     */
    public String uploadFile(MultipartFile file, String folder, String customName) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        // Validate file type (chỉ cho phép ảnh)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh (jpg, png, gif, webp)");
        }

        // Validate file size (max 5MB)
        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("Kích thước file không được vượt quá 5MB");
        }

        // Tạo tên file từ customName hoặc UUID
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
            : ".jpg";
        
        // Sử dụng customName nếu có, ngược lại dùng UUID
        String baseName = (customName != null && !customName.isEmpty()) 
            ? sanitizeFileName(customName) 
            : UUID.randomUUID().toString();
        
        String fileName = folder + "/" + baseName + extension;

        // Upload lên Supabase Storage
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;

        RequestBody requestBody = RequestBody.create(
            file.getBytes(),
            MediaType.parse(contentType)
        );

        Request request = new Request.Builder()
            .url(uploadUrl)
            .addHeader("Authorization", "Bearer " + supabaseKey)
            .addHeader("Content-Type", contentType)
            .post(requestBody)
            .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                throw new IOException("Upload failed: " + response.code() + " - " + errorBody);
            }

            // Trả về public URL
            return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;
        }
    }

    /**
     * Làm sạch tên file: chuyển về dạng URL-friendly
     * VD: "Phân Bón NPK 50kg" -> "phan-bon-npk-50kg"
     */
    private String sanitizeFileName(String name) {
        if (name == null || name.isEmpty()) {
            return UUID.randomUUID().toString();
        }
        
        return name
            .toLowerCase()
            .replaceAll("đ", "d")
            .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
            .replaceAll("[èéẹẻẽêềếệểễ]", "e")
            .replaceAll("[ìíịỉĩ]", "i")
            .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
            .replaceAll("[ùúụủũưừứựửữ]", "u")
            .replaceAll("[ỳýỵỷỹ]", "y")
            .replaceAll("[^a-z0-9]+", "-")  // Thay ký tự đặc biệt bằng dấu gạch ngang
            .replaceAll("^-+|-+$", "")      // Xóa dấu gạch ngang đầu/cuối
            .replaceAll("-+", "-");          // Gộp nhiều dấu gạch ngang thành 1
    }

    /**
     * Xóa file từ Supabase Storage
     * @param fileUrl URL của file cần xóa
     */
    public void deleteFile(String fileUrl) throws IOException {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        // Extract file path từ URL
        String publicPrefix = "/storage/v1/object/public/" + bucketName + "/";
        if (!fileUrl.contains(publicPrefix)) {
            throw new IllegalArgumentException("URL không hợp lệ");
        }

        String filePath = fileUrl.substring(fileUrl.indexOf(publicPrefix) + publicPrefix.length());
        String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;

        Request request = new Request.Builder()
            .url(deleteUrl)
            .addHeader("Authorization", "Bearer " + supabaseKey)
            .delete()
            .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful() && response.code() != 404) {
                throw new IOException("Delete failed: " + response.code());
            }
        }
    }
}
