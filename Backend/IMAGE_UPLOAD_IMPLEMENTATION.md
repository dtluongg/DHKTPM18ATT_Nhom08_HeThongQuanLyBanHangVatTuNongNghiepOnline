# 📸 Tóm tắt Implementation: Upload Ảnh cho Product Unit

## ✅ Đã hoàn thành

### 1. Backend (Spring Boot)

#### 1.1. Dependency (`pom.xml`)

-   ✅ Thêm `storage-kt-jvm` (Supabase Storage Client)
-   ✅ Thêm `okhttp` (HTTP client)

#### 1.2. FileUploadService.java

-   ✅ `uploadFile()` - Upload file lên Supabase Storage bucket
-   ✅ `deleteFile()` - Xóa file từ Supabase Storage
-   ✅ Validation: file type (chỉ ảnh), file size (max 5MB)
-   ✅ Tự động tạo tên file unique với UUID

#### 1.3. ProductUnitController.java

-   ✅ Endpoint mới: `POST /api/product-units/{id}/upload-image`
-   ✅ Nhận `MultipartFile` từ Frontend
-   ✅ Upload lên Supabase, lưu URL vào database
-   ✅ Tự động xóa ảnh cũ khi upload ảnh mới

#### 1.4. Configuration (`application.properties`)

```properties
supabase.url=https://bgwoknkgwdludjoxgsmv.supabase.co
supabase.key=eyJhbGci... (anon key)
supabase.bucket=product-images
```

### 2. Frontend (Next.js/React)

#### 2.1. State Management

-   ✅ `selectedImage` - File đã chọn
-   ✅ `imagePreview` - URL preview ảnh
-   ✅ `uploading` - Trạng thái đang upload

#### 2.2. Handlers

-   ✅ `handleImageChange()` - Xử lý chọn file, validation, tạo preview
-   ✅ `uploadImage()` - Gọi API upload ảnh lên backend
-   ✅ `handleSubmit()` - Lưu product trước, sau đó upload ảnh nếu có

#### 2.3. UI Components

-   ✅ Preview box (128x128px) hiển thị ảnh đã chọn
-   ✅ Input file với label custom "📸 Chọn ảnh"
-   ✅ Hiển thị tên file đã chọn
-   ✅ Loading state khi đang upload
-   ✅ Disable buttons khi đang upload

### 3. Documentation

-   ✅ File `SUPABASE_STORAGE_SETUP.md` - Hướng dẫn setup Supabase Storage bucket và policies

## 🎯 Cách sử dụng

### Bước 1: Setup Supabase Storage

Xem file `Backend/SUPABASE_STORAGE_SETUP.md` để:

1. Tạo bucket `product-images` (public)
2. Thiết lập Storage Policies (READ, INSERT, DELETE)

### Bước 2: Chạy Backend

```bash
cd bvtv_www
./mvnw spring-boot:run
```

### Bước 3: Chạy Frontend

```bash
cd Frontend/bvtv-shop
npm run dev
```

### Bước 4: Test Upload

1. Vào http://localhost:3000/dashboard/admin/product-units
2. Click "Thêm sản phẩm" hoặc "Sửa" sản phẩm có sẵn
3. Click "📸 Chọn ảnh" và chọn file ảnh
4. Preview sẽ hiện ngay lập tức
5. Click "Thêm mới" / "Cập nhật"
6. Ảnh sẽ được upload lên Supabase và URL được lưu vào database

## 📁 Files đã thay đổi/tạo mới

### Backend

1. ✅ `pom.xml` - Thêm dependencies
2. ✅ `FileUploadService.java` - Service xử lý upload (MỚI)
3. ✅ `ProductUnitController.java` - Thêm endpoint upload
4. ✅ `application.properties` - Thêm Supabase config
5. ✅ `Backend/SUPABASE_STORAGE_SETUP.md` - Docs (MỚI)

### Frontend

6. ✅ `app/dashboard/admin/product-units/page.tsx` - Thêm UI upload

**Tổng: 6 files** (4 chỉnh sửa, 2 tạo mới)

## 🐛 Lưu ý quan trọng

### Backend

-   ⚠️ Supabase anon key đang public trong `application.properties` - nên chuyển vào file `.env`
-   ⚠️ Chưa có giới hạn số lượng file upload per user/product
-   ✅ Đã validate file type và size
-   ✅ Đã tự động xóa ảnh cũ khi upload ảnh mới

### Frontend

-   ✅ Preview ảnh real-time trước khi upload
-   ✅ Validation ở client-side
-   ✅ Loading state UX
-   ⚠️ Chưa có progress bar cho upload (có thể thêm sau)

### Database

-   ✅ Field `image_url` đã có sẵn - không cần migration
-   ✅ Có thể null (không bắt buộc phải có ảnh)

## 🔄 Flow hoàn chỉnh

```
User chọn ảnh
    ↓
Frontend validation (type, size)
    ↓
Hiển thị preview
    ↓
User click "Lưu"
    ↓
1. Lưu Product info vào DB (POST/PUT /api/product-units)
    ↓
2. Nếu có ảnh → Upload lên Supabase (POST /api/product-units/{id}/upload-image)
    ↓
3. Backend: Upload file vào folder product-units/ → Lấy public URL → Lưu vào DB field image_url
    ↓
4. Frontend: Refresh danh sách → Hiển thị ảnh
```

## ✅ Testing Checklist

-   [ ] Tạo bucket `product-images` trên Supabase
-   [ ] Set bucket public = true
-   [ ] Tạo Storage Policies (READ, INSERT, DELETE)
-   [ ] Chạy backend: `./mvnw spring-boot:run`
-   [ ] Chạy frontend: `npm run dev`
-   [ ] Test upload ảnh mới cho product mới
-   [ ] Test upload ảnh cho product đã có sẵn
-   [ ] Test thay ảnh (upload ảnh mới thay ảnh cũ)
-   [ ] Xác nhận ảnh cũ bị xóa trên Supabase
-   [ ] Test validation: upload file không phải ảnh
-   [ ] Test validation: upload file > 5MB
-   [ ] Xem ảnh hiển thị đúng trong danh sách products

## 🚀 Next Steps (Tùy chọn)

1. **Bảo mật:**

    - Chuyển Supabase credentials vào `.env` file
    - Thêm rate limiting cho endpoint upload

2. **UX Enhancement:**

    - Thêm progress bar cho upload
    - Thêm crop/resize ảnh trước khi upload
    - Cho phép upload nhiều ảnh (gallery)

3. **Performance:**

    - Optimize ảnh (compress, resize) ở backend
    - Lazy loading ảnh trong table
    - CDN caching

4. **Reusability:**
    - Tái sử dụng `FileUploadService` cho Category, Profile, etc.
    - Tạo shared component `ImageUploader` cho Frontend
