-- =============================================================================
-- V1: Enum Types & Profiles (Kiểu dữ liệu enum & Bảng hồ sơ)
-- =============================================================================
-- File này định nghĩa:
-- 1. Các kiểu ENUM để giới hạn giá trị hợp lệ cho các cột
-- 2. Bảng profiles: Lưu thông tin người dùng (khách hàng, nhà cung cấp, admin...)
-- =============================================================================

-- Extension pgcrypto: Cung cấp hàm gen_random_uuid() để tạo UUID ngẫu nhiên
create extension if not exists pgcrypto;

-- =============================================================================
-- ENUM: profile_role - Vai trò của người dùng
-- =============================================================================
-- customer: Khách hàng mua hàng
-- agent: Đại lý bán hàng
-- supplier: Nhà cung cấp
-- admin: Quản trị viên
-- staff: Nhân viên
do $$ begin
  if not exists (select 1 from pg_type where typname = 'profile_role') then
    create type profile_role as enum ('customer','agent','supplier','admin', 'staff');
  end if;
end $$;

-- =============================================================================
-- ENUM: order_status - Trạng thái đơn hàng
-- =============================================================================
-- pending: Chờ xác nhận
-- confirmed: Đã xác nhận
-- shipped: Đang giao hàng
-- completed: Hoàn thành
-- cancelled: Đã hủy
do $$ begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pending','confirmed','shipped','completed','cancelled');
  end if;
end $$;

-- =============================================================================
-- ENUM: payment_term - Điều khoản thanh toán
-- =============================================================================
-- prepaid: Trả trước (thanh toán online)
-- cod: Thanh toán khi nhận hàng (Cash On Delivery)
-- credit: Công nợ (trả sau)
do $$ begin
  if not exists (select 1 from pg_type where typname = 'payment_term') then
    create type payment_term as enum ('prepaid','cod','credit');
  end if;
end $$;


-- =============================================================================
-- ENUM: inventory_movement_type - Loại phiếu xuất nhập kho
-- =============================================================================
-- purchase: Nhập mua từ NCC
-- sale: Xuất bán cho khách
-- return_in: Nhập trả hàng từ khách
-- return_out: Xuất trả hàng cho NCC
-- adjustment_pos: Điều chỉnh tăng (kiểm kê thừa)
-- adjustment_neg: Điều chỉnh giảm (kiểm kê thiếu)
-- transfer_in: Nhập chuyển kho (từ kho khác)
-- transfer_out: Xuất chuyển kho (sang kho khác)
-- conversion_out: Xuất để chuyển đổi (VD: 1 thùng 20kg -> 20 gói 1kg)
-- conversion_in: Nhập sau chuyển đổi (VD: nhận 20 gói 1kg)
do $$ begin
  if not exists (select 1 from pg_type where typname = 'inventory_movement_type') then
    create type inventory_movement_type as enum (
      'purchase','sale','return_in','return_out','adjustment_pos','adjustment_neg','transfer_in','transfer_out','conversion_out','conversion_in'
    );
  end if;
end $$;


-- ================================================================================
-- TABLE: Areas (khu vực/ấp) và liên kết area_id cho profiles
-- ================================================================================
create table if not exists areas (
  id bigserial primary key,
  name varchar(200) not null,
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
  role profile_role not null default 'customer', -- Vai trò (customer/agent/supplier/admin)
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
