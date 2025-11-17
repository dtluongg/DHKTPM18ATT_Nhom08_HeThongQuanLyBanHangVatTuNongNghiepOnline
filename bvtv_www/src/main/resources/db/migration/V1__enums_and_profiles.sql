-- =============================================================================
-- V1: Areas & Profiles (Khu vực & Hồ sơ người dùng)
-- =============================================================================

-- Extension pgcrypto: Cung cấp hàm gen_random_uuid() để tạo UUID ngẫu nhiên
create extension if not exists pgcrypto;

-- ================================================================================
-- TABLE: Areas (khu vực/ấp)
-- ================================================================================
create table if not exists areas (
  id bigserial primary key,
  name varchar(200) not null,
  is_active boolean not null default true,
  created_at timestamp not null default now()
);



-- =============================================================================
-- TABLE: profiles - Hồ sơ người dùng (Khách hàng, NCC, Admin...)
-- =============================================================================
-- Bảng này lưu thông tin của tất cả người dùng trong hệ thống
-- Phân biệt vai trò qua cột 'role'
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),  -- ID duy nhất (UUID)
  email varchar unique,                           -- Email đăng nhập (unique)
  password_hash text,                             -- Mật khẩu đã mã hóa (bcrypt)
  name varchar,                                   -- Tên người dùng/công ty
  sort_name varchar,                              -- Tên viết tắt/tên gọi khác kèm theo tên ấp/khu vực (VD: "Chú Tư Trà Khúp", "Anh Năm Bổn Thanh")
  phone varchar,                                  -- Số điện thoại
  address text,                                   -- Địa chỉ
  area_id bigint references areas(id) on delete set null, -- Khu vực 
  role varchar(20) not null default 'CUSTOMER' check (role in ('CUSTOMER','AGENT','SUPPLIER','ADMIN','STAFF')), -- Vai trò
  note text,                                      -- Ghi chú nội bộ
  is_active boolean not null default true,        -- Trạng thái hoạt động
  last_login_at timestamp,                      -- Lần đăng nhập cuối
  created_at timestamp not null default now()   -- Ngày tạo
);

-- INDEX: Tăng tốc tìm kiếm theo vai trò
create index if not exists idx_profiles_role on profiles(role);
-- INDEX: Tăng tốc tìm kiếm theo sort_name
create index if not exists idx_profiles_sort_name on profiles(sort_name);
-- INDEX: Tăng tốc tìm kiếm theo area_id
create index if not exists idx_profiles_area_id on profiles(area_id);
