-- ================================================================================
-- V2: Catalog and Reference (Danh mục sản phẩm và dữ liệu tham chiếu)
-- ================================================================================
-- File này định nghĩa:
-- - Danh mục (categories) và thương hiệu (brands) sản phẩm
-- - Sản phẩm (products) với thông tin VAT
-- - Đơn vị sản phẩm (product_units) với giá bán, tồn kho
-- - Phương thức thanh toán (payment_methods)
-- - Phương thức vận chuyển (shipping_methods)
-- - Mã giảm giá (coupons)
-- ================================================================================

-- ================================================================================
-- 1. TABLE: categories (Danh mục sản phẩm)
-- ================================================================================
-- Lưu các danh mục sản phẩm như: phân bón, thuốc BVTV, dụng cụ, v.v.
-- Mỗi sản phẩm có thể thuộc 1 danh mục (hoặc không thuộc danh mục nào)
create table if not exists categories (
  id bigserial primary key,          -- ID tự tăng
  name varchar not null,              -- Tên danh mục (VD: "Phân bón lá", "Thuốc trừ sâu")
  slug varchar unique,                -- URL-friendly slug (VD: "phan-bon-la")
  description text                    -- Mô tả chi tiết danh mục
);

-- ================================================================================
-- 2. TABLE: product_units (Đơn vị sản phẩm - Đã gộp products)
-- ================================================================================
-- Naming convention: "Tên sản phẩm + Đơn vị + Quy cách"
-- VD: "Đường trắng 1kg", "Phân NPK Lâm Thảo bao 50kg", "Thuốc trừ sâu Regent chai 100ml"
create table if not exists product_units (
  id bigserial primary key,
  
  -- Thông tin sản phẩm
  name varchar not null,                      -- ✅ Tên đầy đủ (đã bao gồm đơn vị + quy cách)
  category_id bigint references categories(id),
  brand_name varchar,
  description text,
  image_url varchar,
  vat_rate numeric not null default 0,
  
  -- Thông tin bán hàng
  short_name varchar,                         -- ✅ Tên gọi tắt cho POS (VD: "NPK to", "Regent nhỏ")
  price numeric not null,                     -- ✅ Giá bán (đã bao gồm VAT)
  sku varchar unique,                         -- ✅ Mã SKU nội bộ
  barcode varchar unique,                     -- ✅ Mã vạch (để quét)
  stock integer not null default 0,           -- ✅ Tồn kho hiện tại
  
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on column product_units.name is 'Tên đầy đủ sản phẩm chứa quy cách và size (e.g., "Đường 1kg", "Phân NPK bao 50kg", "Thuốc chai 100ml")';
comment on column product_units.short_name is 'Tên gọi tắt cho POS (VD: "NPK to", "Regent nhỏ")';
comment on column product_units.vat_rate is 'Thuế VAT (%) - VD: 0, 5, 8, 10. Giá đã bao gồm VAT.';

create index if not exists idx_product_units_category on product_units(category_id);
create index if not exists idx_product_units_active on product_units(is_active);
create index if not exists idx_product_units_brand_name on product_units(brand_name);
create index if not exists idx_product_units_name on product_units(name);
create index if not exists idx_product_units_short_name on product_units(short_name);

-- ================================================================================
-- 5. TABLE: payment_methods (Phương thức thanh toán)
-- ================================================================================
-- Lưu các phương thức thanh toán có sẵn (VD: Tiền mặt, Chuyển khoản ngân hàng, Ví điện tử)
create table if not exists payment_methods (
  id bigserial primary key,
  name varchar not null unique,
  for_online boolean not null default true,  -- true = Hiển thị trên online, false = Chỉ POS
  is_active boolean not null default true
);


-- ================================================================================
-- 7. TABLE: coupons (Mã giảm giá)
-- ================================================================================
-- Lưu các mã khuyến mãi/giảm giá cho khách hàng
create table if not exists coupons (
  id bigserial primary key,           -- ID tự tăng
  code varchar not null unique,       -- Mã giảm giá (VD: "SUMMER2024", "NOEL10")
  discount_type varchar,              -- Loại giảm giá: "percent" (%) hoặc "fixed" (số tiền cố định)
  discount_value numeric,             -- Giá trị giảm (VD: 10% hoặc 50,000đ)
  min_order_total numeric,            -- Giá trị đơn hàng tối thiểu để áp dụng
  expiry_date date,                   -- Ngày hết hạn
  usage_limit integer                 -- Số lần sử dụng tối đa (null = không giới hạn)
);
