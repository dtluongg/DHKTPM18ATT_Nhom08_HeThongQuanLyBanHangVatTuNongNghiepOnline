-- ================================================================================
-- V9: Seed Data - Sample Catalog and Goods Receipt
--     (Dữ liệu mẫu - Danh mục sản phẩm và Phiếu nhập kho)
-- ================================================================================
-- File này khởi tạo dữ liệu mẫu để demo hệ thống:
-- 1. Dữ liệu cơ bản: payment_methods, shipping_methods, warehouses
-- 2. Danh mục sản phẩm: 2 categories (Phân bón, Thuốc BVTV)
-- 3. Thương hiệu: 3 brands (Phú Mỹ, Bayer, Syngenta)
-- 4. Sản phẩm: 4 products (NPK, Ure, Karate, Ridomil)
-- 5. Đơn vị sản phẩm: 4 product_units với giá và SKU
-- 6. Nhà cung cấp: 1 supplier (Công ty An Phú)
-- 7. Phiếu nhập kho: 1 goods_receipt với 4 items
-- ================================================================================



-- Thêm ấp
insert into areas (name)
values
  ('Ấp Bổn Thanh');

insert into areas (name)
values
  ('Ấp Trà Khúp');

  -- ================================================================================
-- 4. SEED DATA: Khởi tạo thông tin cửa hàng mặc định
-- ================================================================================
-- Tạo 1 dòng store_settings với tên "Đại lý vật tư nông nghiệp Sáu Hiệp"
do $$
declare wh_id bigint;
begin
  select id into wh_id from warehouses where name='Main' limit 1;
  if not exists (select 1 from store_settings) then
    insert into store_settings(store_name, default_warehouse_id)
    values ('Đại lý vật tư nông nghiệp Sáu Hiệp', wh_id);
  else
    update store_settings set store_name='Đại lý vật tư nông nghiệp Sáu Hiệp'
    where id in (select id from store_settings order by id limit 1);
  end if;
end $$;


-- ================================================================================
-- 1. SEED: Dữ liệu cơ bản (payment_methods, shipping_methods, warehouses)
-- ================================================================================
-- Phương thức thanh toán
INSERT INTO payment_methods (id, name, for_online) VALUES
  (1, 'Tiền mặt', false),              -- Chỉ POS
  (2, 'Chuyển khoản ngân hàng', true), -- Cả online và POS
  (3, 'Thanh toán khi nhận hàng', true), -- Cả online và POS
  (4, 'Nợ', false);              -- Chỉ POS



-- Kho hàng
insert into warehouses(name) values
  ('Main') on conflict do nothing;                          -- Kho chính
-- ================================================================================
-- 2. SEED: Danh mục sản phẩm (categories)
-- ================================================================================
insert into categories(name, slug, description) values
  ('Phân bón', 'phan-bon', 'Các loại phân bón vô cơ và hữu cơ'),       -- Danh mục phân bón
  ('Thuốc BVTV', 'thuoc-bvtv', 'Thuốc bảo vệ thực vật: trừ sâu, bệnh, cỏ dại'); -- Danh mục thuốc BVTV

-- ================================================================================
-- 3. SEED: Sản phẩm (product_units) 
-- ================================================================================
-- Sản phẩm 1: NPK 16-16-8 Phú Mỹ bao 25kg
INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, sku, barcode, stock
)
SELECT 
  'Phân NPK 16-16-8 Phú Mỹ bao 25kg',
  (SELECT id FROM categories WHERE name='Phân bón'),
  'Phú Mỹ',
  'Phân bón NPK 16-16-8 phù hợp nhiều loại cây trồng',
  5,
  'NPK to',
  450000,
  'NPK-16168-25KG',
  '893PM-NPK-25',
  0
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='NPK-16168-25KG');

-- Sản phẩm 2: Đạm Ure Phú Mỹ bao 50kg
INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, sku, barcode, stock
)
SELECT 
  'Đạm Ure Phú Mỹ bao 50kg',
  (SELECT id FROM categories WHERE name='Phân bón'),
  'Phú Mỹ',
  'Đạm Ure hạt đục, hàm lượng đạm cao',
  5,
  'Ure lớn',
  520000,
  'URE-PM-50KG',
  '893PM-URE-50',
  0
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='URE-PM-50KG');

-- Sản phẩm 3: Karate 2.5EC chai 100ml
INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, sku, barcode, stock
)
SELECT 
  'Thuốc trừ sâu Karate 2.5EC chai 100ml',
  (SELECT id FROM categories WHERE name='Thuốc BVTV'),
  'Bayer',
  'Thuốc trừ sâu phổ rộng',
  10,
  'Karate nhỏ',
  65000,
  'KARATE-100ML',
  'BAYER-KRT-100',
  0
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='KARATE-100ML');

-- Sản phẩm 4: Ridomil Gold 68WG gói 100g
INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, sku, barcode, stock
)
SELECT 
  'Thuốc trừ bệnh Ridomil Gold 68WG gói 100g',
  (SELECT id FROM categories WHERE name='Thuốc BVTV'),
  'Syngenta',
  'Trị bệnh do nấm Phytophthora, Pythium',
  10,
  'Ridomil gói',
  55000,
  'RIDOMIL-100G',
  'SYN-RDM-100',
  0
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='RIDOMIL-100G');




