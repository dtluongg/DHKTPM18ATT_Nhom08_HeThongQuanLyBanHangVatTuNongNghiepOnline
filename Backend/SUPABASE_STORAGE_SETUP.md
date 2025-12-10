# 📸 Hướng dẫn Setup Supabase Storage để Upload Ảnh

## 🎯 Mục đích

Tạo Storage Bucket trên Supabase để lưu trữ ảnh sản phẩm (product images).

## 📋 Các bước thực hiện

### Bước 1: Truy cập Supabase Dashboard

1. Đăng nhập vào https://supabase.com/dashboard
2. Chọn project: **bgwoknkgwdludjoxgsmv** (hoặc project của bạn)

### Bước 2: Tạo Storage Bucket

1. Vào menu **Storage** (icon folder bên trái)
2. Click nút **"New Bucket"** hoặc **"Create a new bucket"**
3. Điền thông tin:
    - **Name**: `product-images` (tên bucket, phải khớp với config trong application.properties)
    - **Public bucket**: ✅ **BẬT** (để ảnh có thể truy cập công khai qua URL)
    - **File size limit**: `5 MB` (tùy chọn, giới hạn kích thước file)
    - **Allowed MIME types**: `image/*` (chỉ cho phép upload ảnh)
4. Click **"Create Bucket"**

### Bước 3: Cấu hình Storage Policies (Quyền truy cập)

Sau khi tạo bucket, cần thiết lập policies để cho phép:

-   **READ (SELECT)**: Ai cũng có thể xem ảnh (public)
-   **INSERT**: Chỉ authenticated users hoặc service_role có thể upload
-   **UPDATE**: Chỉ authenticated users hoặc service_role có thể cập nhật metadata
-   **DELETE**: Chỉ authenticated users hoặc service_role có thể xóa

#### 3.1. Tạo Policy cho READ (Public)

1. Vào bucket **product-images** → Tab **Policies**
2. Click **"New Policy"** → **"For full customization"**
3. Điền thông tin:
    - **Policy name**: `Public Read Access`
    - **Allowed operation**: `SELECT` (READ)
    - **Target roles**: `public` (hoặc để trống)
    - **Policy definition**:
        ```sql
        (bucket_id = 'product-images'::text)
        ```
4. Click **"Review"** → **"Save policy"**

#### 3.2. Tạo Policy cho INSERT (Upload)

1. Click **"New Policy"** → **"For full customization"**
2. Điền thông tin:
    - **Policy name**: `Authenticated Upload`
    - **Allowed operation**: `INSERT`
    - **Target roles**: `authenticated` hoặc `service_role`
    - **Policy definition**:
        ```sql
        (bucket_id = 'product-images'::text)
        ```
3. Click **"Review"** → **"Save policy"**

#### 3.3. Tạo Policy cho UPDATE

1. Click **"New Policy"** → **"For full customization"**
2. Điền thông tin:
    - **Policy name**: `Authenticated Update`
    - **Allowed operation**: `UPDATE`
    - **Target roles**: `authenticated` hoặc `service_role`
    - **Policy definition**:
        ```sql
        (bucket_id = 'product-images'::text)
        ```
3. Click **"Review"** → **"Save policy"**

#### 3.4. Tạo Policy cho DELETE

1. Click **"New Policy"** → **"For full customization"**
2. Điền thông tin:
    - **Policy name**: `Authenticated Delete`
    - **Allowed operation**: `DELETE`
    - **Target roles**: `authenticated` hoặc `service_role`
    - **Policy definition**:
        ```sql
        (bucket_id = 'product-images'::text)
        ```
3. Click **"Review"** → **"Save policy"**

---

### ⚡ Cách nhanh (Recommended cho Development):

**Thay vì tạo 4 policies riêng, tạo 1 policy cho TẤT CẢ:**

1. Vào bucket **product-images** → Tab **Policies**
2. Click **"New Policy"** → **"For full customization"**
3. Điền thông tin:
    - **Policy name**: `Allow All Operations`
    - **Allowed operation**: Chọn **TẤT CẢ** (SELECT, INSERT, UPDATE, DELETE)
    - **Target roles**: để trống (hoặc `public`)
    - **Policy definition**: `true`
4. Click **"Review"** → **"Save policy"**

✅ **Xong!** Chỉ cần 1 policy này là đủ cho development/testing.

---

### Bước 4: Lấy Supabase API Key

Đã có sẵn trong `application.properties`:

```properties
supabase.url=https://bgwoknkgwdludjoxgsmv.supabase.co
supabase.key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
supabase.bucket=product-images
```

**Nếu cần lấy lại API Key:**

1. Vào **Settings** → **API**
2. Copy **Project URL** → điền vào `supabase.url`
3. Copy **anon public** key → điền vào `supabase.key`

### Bước 5: Test Upload

#### 5.1. Sử dụng Postman/Thunder Client

```http
POST http://localhost:8080/api/product-units/1/upload-image
Content-Type: multipart/form-data

Body (form-data):
- Key: file
- Type: File
- Value: [Chọn file ảnh]
```

#### 5.2. Kiểm tra kết quả

Response thành công:

```json
{
    "imageUrl": "https://bgwoknkgwdludjoxgsmv.supabase.co/storage/v1/object/public/product-images/product-units/abc-123.jpg",
    "message": "Upload ảnh thành công"
}
```

#### 5.3. Xem ảnh đã upload

1. Vào **Storage** → Bucket **product-images**
2. Sẽ thấy folder **product-units/** chứa ảnh vừa upload
3. Hoặc paste URL từ response vào browser để xem ảnh

## ✅ Hoàn tất!

Sau khi setup xong:

-   ✅ Backend có thể upload ảnh lên Supabase
-   ✅ Ảnh được lưu tại bucket `product-images/product-units/`
-   ✅ URL ảnh được lưu vào database field `image_url`
-   ✅ Có thể xem ảnh qua public URL

## 🐛 Troubleshooting

### Lỗi 403 Forbidden khi upload

→ Kiểm tra lại Policies, đảm bảo đã tạo policy INSERT cho authenticated/service_role

### Lỗi 404 Not Found khi xem ảnh

→ Kiểm tra bucket có phải **Public** không, và policy READ đã được tạo

### Lỗi "Bucket not found"

→ Kiểm tra tên bucket trong `application.properties` khớp với tên bucket trên Supabase

### File upload quá lớn

→ Giảm kích thước ảnh hoặc tăng file size limit trong bucket settings
