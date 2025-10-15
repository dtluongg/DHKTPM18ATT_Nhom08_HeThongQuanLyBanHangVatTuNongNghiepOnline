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
-- 2. TABLE: brands (Thương hiệu sản phẩm)
-- ================================================================================
-- Lưu thông tin các thương hiệu/nhãn hiệu sản phẩm
create table if not exists brands (
  id bigserial primary key,           -- ID tự tăng
  name varchar not null,              -- Tên thương hiệu (VD: "Lâm Thảo", "Bayer")
  slug varchar unique,                -- URL-friendly slug
  country varchar                     -- Quốc gia sản xuất (VD: "Việt Nam", "Germany")
);

-- ================================================================================
-- 3. TABLE: products (Sản phẩm)
-- ================================================================================
-- Lưu thông tin chung về sản phẩm (không bao gồm đơn vị tính và giá bán)
-- Một sản phẩm có thể có nhiều đơn vị bán (VD: chai, lít, hộp)
create table if not exists products (
  id bigserial primary key,                                                      -- ID tự tăng
  category_id bigint references categories(id) on delete set null,               -- Danh mục sản phẩm (nullable)
  brand_id bigint references brands(id) on delete set null,                      -- Thương hiệu (nullable)
  name varchar not null,                                                         -- Tên sản phẩm (VD: "Herbicide Glyphosate 480SL")
  slug varchar unique,                                                           -- URL-friendly slug
  description text,                                                              -- Mô tả chi tiết sản phẩm
  image_url text,                                                                -- Link ảnh sản phẩm
  vat_rate numeric not null default 10 check (vat_rate >= 0 and vat_rate <= 20), -- Thuế VAT (%) áp dụng cho sản phẩm này
  is_active boolean not null default true,                                       -- Còn kinh doanh không?
  created_at timestamptz not null default now()                                  -- Ngày tạo
);

comment on column products.vat_rate is 'VAT rate (%) at product level, e.g., 0, 5, 8, 10. Price fields are VAT-included.';

-- INDEX cho products: tăng tốc truy vấn theo category, brand, trạng thái active
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_brand on products(brand_id);
create index if not exists idx_products_active on products(is_active);

-- ================================================================================
-- 4. TABLE: product_units (Đơn vị sản phẩm)
-- ================================================================================
-- Lưu các đơn vị bán của sản phẩm kèm giá và tồn kho
-- VD: "Phân NPK Lâm Thảo" có thể có 3 đơn vị:
--     - Bao 50kg: 500,000đ - gọi tắt "NPK to"
--     - Bao 25kg: 260,000đ - gọi tắt "NPK vừa"
--     - Túi 5kg: 55,000đ - gọi tắt "NPK nhỏ"
create table if not exists product_units (
  id bigserial primary key,                                      -- ID tự tăng
  product_id bigint not null references products(id) on delete cascade, -- Sản phẩm thuộc về
  unit varchar,                                                  -- Đơn vị (VD: "bao", "chai", "lít", "hộp")
  size_label varchar,                                            -- Nhãn quy cách (VD: "50kg", "1 lít", "500ml")
  short_name varchar,                                            -- Tên gọi tắt (VD: "Con Rồng to", "Thuốc gầy nhỏ")
  net_qty numeric,                                               -- Trọng lượng/thể tích thực (VD: 50)
  uom varchar,                                                   -- Đơn vị đo (VD: "kg", "lít", "ml")
  price numeric not null,                                        -- Giá bán (đã bao gồm VAT)
  sku varchar unique,                                            -- Mã SKU nội bộ
  barcode varchar unique,                                        -- Mã vạch (để quét)
  stock integer not null default 0,                              -- Tồn kho hiện tại (số lượng)
  is_active boolean not null default true                        -- Còn bán không?
);

comment on column product_units.short_name is 'Vietnamese short name for quick sales reference (e.g., "Con Rồng to", "Thuốc gầy chai nhỏ")';

-- INDEX cho product_units: tăng tốc truy vấn theo product và trạng thái active
create index if not exists idx_product_units_product on product_units(product_id);
create index if not exists idx_product_units_active on product_units(is_active);
create index if not exists idx_product_units_short_name on product_units(short_name);

-- ================================================================================
-- 5. TABLE: payment_methods (Phương thức thanh toán)
-- ================================================================================
-- Lưu các phương thức thanh toán có sẵn (VD: Tiền mặt, Chuyển khoản, Ví điện tử)
create table if not exists payment_methods (
  id bigserial primary key,           -- ID tự tăng
  name varchar not null unique        -- Tên phương thức (VD: "Tiền mặt", "Chuyển khoản ngân hàng")
);

-- ================================================================================
-- 6. TABLE: shipping_methods (Phương thức vận chuyển)
-- ================================================================================
-- Lưu các hình thức giao hàng (VD: Giao hàng tiêu chuẩn, Giao nhanh, Nhận tại cửa hàng)
create table if not exists shipping_methods (
  id bigserial primary key,           -- ID tự tăng
  name varchar not null unique,       -- Tên phương thức (VD: "Giao hàng tiêu chuẩn", "Giao nhanh trong 2h")
  description text                    -- Mô tả chi tiết (VD: phí ship, thời gian giao hàng)
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
