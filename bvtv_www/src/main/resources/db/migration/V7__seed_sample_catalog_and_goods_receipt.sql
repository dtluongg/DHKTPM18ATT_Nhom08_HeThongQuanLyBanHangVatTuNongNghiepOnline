-- ================================================================================
-- V6: Seed Data - Complete Database Sample Data
--     (Dữ liệu mẫu đầy đủ cho hệ thống)
-- ================================================================================
-- File này khởi tạo dữ liệu mẫu đầy đủ để demo hệ thống:
-- 1. Areas (Khu vực/Ấp)
-- 2. Warehouses (Kho hàng)
-- 3. Store Settings (Thông tin cửa hàng)
-- 4. Payment Methods (Phương thức thanh toán)
-- 5. Categories (Danh mục sản phẩm)
-- 6. Product Units (Sản phẩm)
-- 7. Coupons (Mã giảm giá)
-- 8. Profiles (Khách hàng, Nhà cung cấp, Admin, Nhân viên)
-- 9. Inventory Movements (Nhập kho ban đầu)
-- 10. Orders (Đơn hàng mẫu)
-- ================================================================================

-- ================================================================================
-- 1. SEED: Areas (Khu vực/Ấp)
-- ================================================================================
INSERT INTO areas (name) VALUES
  ('Ấp Bổn Thanh'),
  ('Ấp Trà Khúp'),
  ('Ấp Sóc Cuôi'),
  ('Ấp Sóc Ớt'),
  ('Ấp Bàu Cát');

-- ================================================================================
-- 2. SEED: Warehouses (Kho hàng)
-- ================================================================================
INSERT INTO warehouses(name, address) VALUES
  ('Kho chính', 'Ấp Sóc Ruộng, xã Ngũ Lạc, phường Duyên Hải, tỉnh Vĩnh Long'),
  ('Kho phụ', 'Ấp Bổn Thanh, xã Ngũ Lạc, phường Duyên Hải, tỉnh Vĩnh Long')
ON CONFLICT DO NOTHING;

-- ================================================================================
-- 3. SEED: Store Settings (Thông tin cửa hàng)
-- ================================================================================
DO $$
DECLARE 
  wh_id bigint;
BEGIN
  SELECT id INTO wh_id FROM warehouses WHERE name='Kho chính' LIMIT 1;
  
  IF NOT EXISTS (SELECT 1 FROM store_settings) THEN
    INSERT INTO store_settings(
      store_name, 
      legal_name,
      phone,
      email,
      address,
      tax_id,
      default_warehouse_id
    )
    VALUES (
      'Đại lý vật tư nông nghiệp Sáu Hiệp',
      'CÔNG TY TNHH MỘT THÀNH VIÊN SÁU HIỆP',
      '0522714563',
      'sauhiep.dailyvtnt@gmail.com',
      'Ấp Sóc Ruộng, xã Ngũ Lạc, phường Duyên Hải, tỉnh Vĩnh Long',
      '0123456789',
      wh_id
    );
  ELSE
    UPDATE store_settings 
    SET 
      store_name = 'Đại lý vật tư nông nghiệp Sáu Hiệp',
      legal_name = 'CÔNG TY TNHH MỘT THÀNH VIÊN SÁU HIỆP',
      phone = '0522714563',
      email = 'sauhiep.dailyvtnt@gmail.com',
      address = 'Ấp Sóc Ruộng, xã Ngũ Lạc, phường Duyên Hải, tỉnh Vĩnh Long',
      tax_id = '0123456789',
      default_warehouse_id = wh_id
    WHERE id IN (SELECT id FROM store_settings ORDER BY id LIMIT 1);
  END IF;
END $$;

-- ================================================================================
-- 4. SEED: Payment Methods (Phương thức thanh toán)
-- ================================================================================
INSERT INTO payment_methods (name, for_online, is_active) VALUES
  ('Tiền mặt', false, true),                      -- Chỉ POS
  ('Chuyển khoản ngân hàng', true, true),         -- Cả online và POS
  ('Thanh toán khi nhận hàng (COD)', true, true), -- Cả online và POS
  ('Nợ', false, true)
ON CONFLICT (name) DO UPDATE SET 
  for_online = EXCLUDED.for_online,
  is_active = EXCLUDED.is_active;

-- ================================================================================
-- 5. SEED: Categories (Danh mục sản phẩm)
-- ================================================================================
INSERT INTO categories(name, slug, description) VALUES
  ('Phân bón', 'phan-bon', 'Các loại phân bón vô cơ, hữu cơ và phân vi sinh'),
  ('Thuốc BVTV', 'thuoc-bvtv', 'Thuốc bảo vệ thực vật: trừ sâu, trừ bệnh, trừ cỏ dại'),
  ('Giống cây trồng', 'giong-cay-trong', 'Hạt giống, cây giống các loại'),
  ('Dụng cụ nông nghiệp', 'dung-cu-nong-nghiep', 'Máy móc, dụng cụ hỗ trợ sản xuất nông nghiệp'),
  ('Thức ăn chăn nuôi', 'thuc-an-chan-nuoi', 'Thức ăn và phụ gia cho gia súc, gia cầm')
ON CONFLICT DO NOTHING;

-- ================================================================================
-- 6. SEED: Product Units (Sản phẩm)
-- ================================================================================
-- Phân bón
INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Phân NPK 16-16-8 Phú Mỹ bao 25kg',
  (SELECT id FROM categories WHERE slug='phan-bon'),
  'Phú Mỹ',
  'Phân bón NPK 16-16-8 phù hợp nhiều loại cây trồng, tăng năng suất',
  5,
  'NPK 16-16-8 25kg',
  450000,
  460000,
  'NPK-16168-25KG',
  '8936014760251',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='NPK-16168-25KG');

INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Phán NPK 20-20-15 Lâm Thảo bao 50kg',
  (SELECT id FROM categories WHERE slug='phan-bon'),
  'Lâm Thảo',
  'Phân bón NPK 20-20-15 giàu dinh dưỡng, phù hợp lúa, ngô',
  5,
  'NPK 20-20-15 50kg',
  920000,
  940000,
  'NPK-202015-50KG',
  '8936014760268',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='NPK-202015-50KG');

INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Đạm Ure Phú Mỹ bao 50kg',
  (SELECT id FROM categories WHERE slug='phan-bon'),
  'Phú Mỹ',
  'Đạm Ure hạt đục, hàm lượng đạm 46%, kích thích cây phát triển',
  5,
  'Ure 50kg',
  520000,
  530000,
  'URE-PM-50KG',
  '8936014760275',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='URE-PM-50KG');

INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Phân DAP Lâm Thảo bao 50kg',
  (SELECT id FROM categories WHERE slug='phan-bon'),
  'Lâm Thảo',
  'Phân lân DAP 18-46-0, cung cấp lân cho cây trồng',
  5,
  'DAP 50kg',
  880000,
  900000,
  'DAP-LT-50KG',
  '8936014760282',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='DAP-LT-50KG');

INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Phân hữu cơ vi sinh Tribat bao 40kg',
  (SELECT id FROM categories WHERE slug='phan-bon'),
  'Tribat',
  'Phân bón hữu cơ vi sinh, cải tạo đất, bổ sung vi sinh có ích',
  5,
  'Tribat 40kg',
  350000,
  360000,
  'TRIBAT-40KG',
  '8936014760299',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='TRIBAT-40KG');

-- Thuốc BVTV
INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Thuốc trừ sâu Karate 2.5EC chai 100ml',
  (SELECT id FROM categories WHERE slug='thuoc-bvtv'),
  'Bayer',
  'Thuốc trừ sâu phổ rộng, diệt sâu đục thân, sâu cuốn lá',
  10,
  'Karate 100ml',
  65000,
  68000,
  'KARATE-100ML',
  '8935212344567',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='KARATE-100ML');

INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Thuốc trừ sâu Karate 2.5EC chai 500ml',
  (SELECT id FROM categories WHERE slug='thuoc-bvtv'),
  'Bayer',
  'Thuốc trừ sâu phổ rộng, quy cách lớn tiết kiệm',
  10,
  'Karate 500ml',
  280000,
  290000,
  'KARATE-500ML',
  '8935212344574',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='KARATE-500ML');

INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Thuốc trừ bệnh Ridomil Gold 68WG gói 100g',
  (SELECT id FROM categories WHERE slug='thuoc-bvtv'),
  'Syngenta',
  'Trị bệnh do nấm Phytophthora, Pythium, chống thối rễ, héo xanh',
  10,
  'Ridomil 100g',
  55000,
  58000,
  'RIDOMIL-100G',
  '8935212344581',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='RIDOMIL-100G');

INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Thuốc trừ bệnh Antracol 70WP gói 1kg',
  (SELECT id FROM categories WHERE slug='thuoc-bvtv'),
  'Bayer',
  'Phòng trừ bệnh sương mai, bệnh đạo ôn trên lúa',
  10,
  'Antracol 1kg',
  180000,
  185000,
  'ANTRACOL-1KG',
  '8935212344598',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='ANTRACOL-1KG');

INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Thuốc diệt cỏ Gramoxone 20SL chai 1 lít',
  (SELECT id FROM categories WHERE slug='thuoc-bvtv'),
  'Syngenta',
  'Diệt cỏ tiếp xúc, tác dụng nhanh, khô héo sau 2-3 ngày',
  10,
  'Gramoxone 1L',
  95000,
  98000,
  'GRAMOXONE-1L',
  '8935212344604',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='GRAMOXONE-1L');

INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Thuốc diệt cỏ Butachlor 60EC chai 1 lít',
  (SELECT id FROM categories WHERE slug='thuoc-bvtv'),
  'Sao Vàng',
  'Diệt cỏ tiền xuất, phun trước khi cỏ mọc, dùng cho lúa',
  10,
  'Butachlor 1L',
  75000,
  78000,
  'BUTACHLOR-1L',
  '8935212344611',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='BUTACHLOR-1L');

-- Giống cây trồng
INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Hạt giống lúa ST25 gói 1kg',
  (SELECT id FROM categories WHERE slug='giong-cay-trong'),
  'An Giang Plant',
  'Giống lúa ST25 thơm ngon, năng suất cao',
  5,
  'ST25 1kg',
  150000,
  155000,
  'SEED-ST25-1KG',
  '8936014760305',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='SEED-ST25-1KG');

INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Hạt giống ngô lai CP888 gói 500g',
  (SELECT id FROM categories WHERE slug='giong-cay-trong'),
  'Charoen Pokphand',
  'Giống ngô lai năng suất cao, chống bệnh tốt',
  5,
  'CP888 500g',
  85000,
  88000,
  'SEED-CP888-500G',
  '8936014760312',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='SEED-CP888-500G');

-- Dụng cụ
INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Bình xịt thuốc cầm tay 16 lít',
  (SELECT id FROM categories WHERE slug='dung-cu-nong-nghiep'),
  'Việt Nam',
  'Bình xịt thuốc BVTV dung tích 16 lít, tay cầm tiện lợi',
  10,
  'Bình xịt 16L',
  450000,
  460000,
  'TOOL-SPRAYER-16L',
  '8936014760329',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='TOOL-SPRAYER-16L');

INSERT INTO product_units(
  name, category_id, brand_name, description, vat_rate,
  short_name, price, credit_price, sku, barcode, stock, is_active
)
SELECT 
  'Máy phun thuốc BVTV Honda GX35',
  (SELECT id FROM categories WHERE slug='dung-cu-nong-nghiep'),
  'Honda',
  'Máy phun thuốc động cơ xăng, công suất mạnh',
  10,
  'Máy phun Honda',
  6500000,
  6600000,
  'TOOL-SPRAYER-HONDA',
  '8936014760336',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM product_units WHERE sku='TOOL-SPRAYER-HONDA');

-- ================================================================================
-- 7. SEED: Coupons (Mã giảm giá)
-- ================================================================================
INSERT INTO coupons (code, discount_type, discount_value, min_order_total, expiry_date, usage_limit) VALUES
  ('KHAIMO2024', 'percent', 10, 1000000, '2024-12-31', 100),           -- Giảm 10% đơn từ 1 triệu
  ('TETAM2025', 'percent', 15, 5000000, '2025-02-28', 50),             -- Giảm 15% đơn từ 5 triệu
  ('MUAVANG50K', 'fixed', 50000, 500000, '2025-06-30', NULL),          -- Giảm 50k đơn từ 500k
  ('TRUNGTHU100K', 'fixed', 100000, 2000000, '2025-09-30', 200),       -- Giảm 100k đơn từ 2 triệu
  ('NHANOONG5', 'percent', 5, 300000, '2025-12-31', NULL)              -- Giảm 5% đơn từ 300k (không giới hạn)
ON CONFLICT (code) DO NOTHING;

-- ================================================================================
-- 8. SEED: Profiles (Người dùng)
-- ================================================================================
-- Lưu ý: Password được mã hóa bằng BCrypt thông qua Spring Security
-- Trong môi trường production, nên để password_hash = NULL và yêu cầu đổi password lần đầu đăng nhập

-- Admin (email: admin@sauhiep.vn, password: 123)
INSERT INTO profiles (
  email, password_hash, name, sort_name, phone, address, area_id, role, is_active
) 
SELECT 
  'admin@sauhiep.vn',
  '$2a$10$X5wFBtLrL0aWnNqBqOqrXee5o8lUqbGxKDfxH2YrTLMG/yLLEYAi2', -- BCrypt hash of "123"
  'Nguyễn Văn Sáu',
  'Anh Sáu',
  '0522714563',
  'Ấp Bổn Thanh, xã Ngũ Lạc, phường Duyên Hải, tỉnh Vĩnh Long',
  (SELECT id FROM areas WHERE name='Ấp Bổn Thanh'),
  'admin',
  true
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@sauhiep.vn');

-- Staff (email: nhanvien@sauhiep.vn, password: 123)
INSERT INTO profiles (
  email, password_hash, name, sort_name, phone, address, area_id, role, is_active
) 
SELECT
  'nhanvien@sauhiep.vn',
  '$2a$10$X5wFBtLrL0aWnNqBqOqrXee5o8lUqbGxKDfxH2YrTLMG/yLLEYAi2', -- BCrypt hash of "123"
  'Trần Thị Hiệp',
  'Chị Hiệp',
  '0908234567',
  'Ấp Bổn Thanh, xã Ngũ Lạc, phường Duyên Hải, tỉnh Vĩnh Long',
  (SELECT id FROM areas WHERE name='Ấp Bổn Thanh'),
  'staff',
  true
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'nhanvien@sauhiep.vn');

-- Customers
INSERT INTO profiles (name, sort_name, phone, address, area_id, role, note, is_active) VALUES
  ('Lê Văn Tư', 'Chú Tư Trà Khúp', '0901234567', 'Ấp Trà Khúp, Tân Thành, Tân Phú, Đồng Nai', 
   (SELECT id FROM areas WHERE name='Ấp Trà Khúp'), 'customer', 'Khách quen, thường mua phân bón', true),
  
  ('Phạm Thị Năm', 'Cô Năm Bổn Thanh', '0902345678', 'Ấp Bổn Thanh, xã Ngũ Lạc, phường Duyên Hải, tỉnh Vĩnh Long',
   (SELECT id FROM areas WHERE name='Ấp Bổn Thanh'), 'customer', 'Trồng lúa, có thể bán công nợ', true),
  
  ('Huỳnh Văn Bảy', 'Anh Bảy Sóc Cuôi', '0903456789', 'Ấp Sóc Cuôi, xã Ngũ Lạc, phường Duyên Hải, tỉnh Vĩnh Long',
   (SELECT id FROM areas WHERE name='Ấp Sóc Cuôi'), 'customer', 'Trồng ngô, hay mua thuốc trừ sâu', true),
  
  ('Nguyễn Thị Tám', 'Bà Tám Sóc Ớt', '0904567890', 'Ấp Sóc Ớt, xã Ngũ Lạc, phường Duyên Hải, tỉnh Vĩnh Long',
   (SELECT id FROM areas WHERE name='Ấp Sóc Ớt'), 'customer', NULL, true),
  
  ('Võ Văn Chín', 'Chú Chín Bàu Cát', '0905678901', 'Ấp Bàu Cát, xã Ngũ Lạc, phường Duyên Hải, tỉnh Vĩnh Long',
   (SELECT id FROM areas WHERE name='Ấp Bàu Cát'), 'customer', 'Khách mới, thanh toán tiền mặt', true),
  
  ('Trần Văn Mười', 'Anh Mười Trà Khúp', '0906789012', 'Ấp Trà Khúp, xã Ngũ Lạc, phường Duyên Hải, tỉnh Vĩnh Long',
   (SELECT id FROM areas WHERE name='Ấp Trà Khúp'), 'customer', 'Khách VIP, hay mua số lượng lớn', true);

-- Suppliers
INSERT INTO profiles (name, sort_name, phone, address, role, note, is_active) VALUES
  ('Công ty TNHH Phân bón Phú Mỹ', 'Phú Mỹ', '02513822222', 'KCN Phú Mỹ, Bà Rịa - Vũng Tàu', 
   'supplier', 'Nhà cung cấp phân bón chính', true),
  
  ('Công ty CP Hóa chất Lâm Thảo', 'Lâm Thảo', '02103852222', 'Lâm Thảo, Phú Thọ',
   'supplier', 'Nhà cung cấp phân bón NPK, DAP', true),
  
  ('Công ty TNHH Bayer Việt Nam', 'Bayer VN', '02838242424', 'Quận 1, TP.HCM',
   'supplier', 'Nhà cung cấp thuốc BVTV nhập khẩu', true),
  
  ('Công ty TNHH Syngenta Việt Nam', 'Syngenta VN', '02838345678', 'Quận 1, TP.HCM',
   'supplier', 'Nhà cung cấp thuốc BVTV cao cấp', true);

-- Agents
INSERT INTO profiles (name, sort_name, phone, address, area_id, role, note, is_active) VALUES
  ('Đại lý Nông nghiệp Tân Phú', 'ĐL Tân Phú', '0907890123', 'TT Tân Phú, Tân Phú, Đồng Nai',
   NULL, 'agent', 'Đại lý cấp 2, bán buôn', true);

-- ================================================================================
-- 9. SEED: Inventory Movements (Nhập kho ban đầu)
-- ================================================================================
-- Nhập kho ban đầu cho các sản phẩm phân bón
DO $$
DECLARE
  wh_id bigint;
  pu_id bigint;
BEGIN
  SELECT id INTO wh_id FROM warehouses WHERE name='Kho chính' LIMIT 1;
  
  -- NPK 16-16-8 25kg: Nhập 100 bao
  SELECT id INTO pu_id FROM product_units WHERE sku='NPK-16168-25KG';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 100, 'manual_init', NULL, NOW() - INTERVAL '30 days');
  
  -- NPK 20-20-15 50kg: Nhập 50 bao
  SELECT id INTO pu_id FROM product_units WHERE sku='NPK-202015-50KG';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 50, 'manual_init', NULL, NOW() - INTERVAL '30 days');
  
  -- Ure 50kg: Nhập 80 bao
  SELECT id INTO pu_id FROM product_units WHERE sku='URE-PM-50KG';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 80, 'manual_init', NULL, NOW() - INTERVAL '30 days');
  
  -- DAP 50kg: Nhập 40 bao
  SELECT id INTO pu_id FROM product_units WHERE sku='DAP-LT-50KG';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 40, 'manual_init', NULL, NOW() - INTERVAL '30 days');
  
  -- Tribat 40kg: Nhập 30 bao
  SELECT id INTO pu_id FROM product_units WHERE sku='TRIBAT-40KG';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 30, 'manual_init', NULL, NOW() - INTERVAL '30 days');
  
  -- Karate 100ml: Nhập 200 chai
  SELECT id INTO pu_id FROM product_units WHERE sku='KARATE-100ML';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 200, 'manual_init', NULL, NOW() - INTERVAL '25 days');
  
  -- Karate 500ml: Nhập 50 chai
  SELECT id INTO pu_id FROM product_units WHERE sku='KARATE-500ML';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 50, 'manual_init', NULL, NOW() - INTERVAL '25 days');
  
  -- Ridomil 100g: Nhập 150 gói
  SELECT id INTO pu_id FROM product_units WHERE sku='RIDOMIL-100G';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 150, 'manual_init', NULL, NOW() - INTERVAL '25 days');
  
  -- Antracol 1kg: Nhập 60 gói
  SELECT id INTO pu_id FROM product_units WHERE sku='ANTRACOL-1KG';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 60, 'manual_init', NULL, NOW() - INTERVAL '25 days');
  
  -- Gramoxone 1L: Nhập 80 chai
  SELECT id INTO pu_id FROM product_units WHERE sku='GRAMOXONE-1L';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 80, 'manual_init', NULL, NOW() - INTERVAL '20 days');
  
  -- Butachlor 1L: Nhập 100 chai
  SELECT id INTO pu_id FROM product_units WHERE sku='BUTACHLOR-1L';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 100, 'manual_init', NULL, NOW() - INTERVAL '20 days');
  
  -- Hạt giống ST25 1kg: Nhập 50 gói
  SELECT id INTO pu_id FROM product_units WHERE sku='SEED-ST25-1KG';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 50, 'manual_init', NULL, NOW() - INTERVAL '15 days');
  
  -- Hạt giống CP888 500g: Nhập 40 gói
  SELECT id INTO pu_id FROM product_units WHERE sku='SEED-CP888-500G';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 40, 'manual_init', NULL, NOW() - INTERVAL '15 days');
  
  -- Bình xịt 16L: Nhập 20 cái
  SELECT id INTO pu_id FROM product_units WHERE sku='TOOL-SPRAYER-16L';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 20, 'manual_init', NULL, NOW() - INTERVAL '10 days');
  
  -- Máy phun Honda: Nhập 5 cái
  SELECT id INTO pu_id FROM product_units WHERE sku='TOOL-SPRAYER-HONDA';
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'purchase', 5, 'manual_init', NULL, NOW() - INTERVAL '10 days');
  
END $$;

-- ================================================================================
-- 10. SEED: Orders (Đơn hàng mẫu)
-- ================================================================================
-- Đơn hàng 1: Chú Tư mua phân bón (Completed)
DO $$
DECLARE
  ord_id bigint;
  buyer_uuid uuid;
  pm_id bigint;
  pu_id bigint;
  wh_id bigint;
  item_qty int;
  item_price numeric;
  item_vat_rate numeric;
  item_vat_amt numeric;
BEGIN
  SELECT id INTO buyer_uuid FROM profiles WHERE sort_name='Chú Tư Trà Khúp';
  SELECT id INTO pm_id FROM payment_methods WHERE name='Tiền mặt';
  SELECT id INTO wh_id FROM warehouses WHERE name='Kho chính' LIMIT 1;
  
  -- Tạo order
  INSERT INTO orders (buyer_id, total_amount, total_vat, discount_total, status, payment_method_id, payment_term, is_online, created_at)
  VALUES (buyer_uuid, 3310000, 157619, 0, 'completed', pm_id, 'prepaid', false, NOW() - INTERVAL '20 days')
  RETURNING id INTO ord_id;
  
  -- Order item 1: NPK 16-16-8 25kg x 5 bao
  SELECT id, price, vat_rate INTO pu_id, item_price, item_vat_rate FROM product_units WHERE sku='NPK-16168-25KG';
  item_qty := 5;
  item_vat_amt := ROUND((item_price * item_qty * item_vat_rate / (100 + item_vat_rate))::numeric, 0);
  INSERT INTO order_items (order_id, product_unit_id, quantity, price, discount_amount, vat_rate, vat_amount)
  VALUES (ord_id, pu_id, item_qty, item_price, 0, item_vat_rate, item_vat_amt);
  
  -- Tạo inventory movement cho order item 1
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'sale', item_qty, 'order_items', currval('order_items_id_seq'), NOW() - INTERVAL '20 days');
  
  -- Order item 2: Ure 50kg x 2 bao
  SELECT id, price, vat_rate INTO pu_id, item_price, item_vat_rate FROM product_units WHERE sku='URE-PM-50KG';
  item_qty := 2;
  item_vat_amt := ROUND((item_price * item_qty * item_vat_rate / (100 + item_vat_rate))::numeric, 0);
  INSERT INTO order_items (order_id, product_unit_id, quantity, price, discount_amount, vat_rate, vat_amount)
  VALUES (ord_id, pu_id, item_qty, item_price, 0, item_vat_rate, item_vat_amt);
  
  -- Tạo inventory movement cho order item 2
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'sale', item_qty, 'order_items', currval('order_items_id_seq'), NOW() - INTERVAL '20 days');
  
  -- Order item 3: Karate 100ml x 10 chai
  SELECT id, price, vat_rate INTO pu_id, item_price, item_vat_rate FROM product_units WHERE sku='KARATE-100ML';
  item_qty := 10;
  item_vat_amt := ROUND((item_price * item_qty * item_vat_rate / (100 + item_vat_rate))::numeric, 0);
  INSERT INTO order_items (order_id, product_unit_id, quantity, price, discount_amount, vat_rate, vat_amount)
  VALUES (ord_id, pu_id, item_qty, item_price, 0, item_vat_rate, item_vat_amt);
  
  -- Tạo inventory movement cho order item 3
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'sale', item_qty, 'order_items', currval('order_items_id_seq'), NOW() - INTERVAL '20 days');
  
END $$;

-- Đơn hàng 2: Cô Năm mua công nợ (Confirmed)
DO $$
DECLARE
  ord_id bigint;
  buyer_uuid uuid;
  pm_id bigint;
  pu_id bigint;
  wh_id bigint;
  item_qty int;
  item_price numeric;
  item_vat_rate numeric;
  item_vat_amt numeric;
BEGIN
  SELECT id INTO buyer_uuid FROM profiles WHERE sort_name='Cô Năm Bổn Thanh';
  SELECT id INTO pm_id FROM payment_methods WHERE name='Công nợ';
  SELECT id INTO wh_id FROM warehouses WHERE name='Kho chính' LIMIT 1;
  
  -- Tạo order
  INSERT INTO orders (buyer_id, total_amount, total_vat, discount_total, status, payment_method_id, payment_term, is_online, created_at)
  VALUES (buyer_uuid, 2310000, 110000, 0, 'confirmed', pm_id, 'credit', false, NOW() - INTERVAL '15 days')
  RETURNING id INTO ord_id;
  
  -- Order item 1: NPK 20-20-15 50kg x 2 bao
  SELECT id, price, vat_rate INTO pu_id, item_price, item_vat_rate FROM product_units WHERE sku='NPK-202015-50KG';
  item_qty := 2;
  item_vat_amt := ROUND((item_price * item_qty * item_vat_rate / (100 + item_vat_rate))::numeric, 0);
  INSERT INTO order_items (order_id, product_unit_id, quantity, price, discount_amount, vat_rate, vat_amount)
  VALUES (ord_id, pu_id, item_qty, item_price, 0, item_vat_rate, item_vat_amt);
  
  -- Tạo inventory movement
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'sale', item_qty, 'order_items', currval('order_items_id_seq'), NOW() - INTERVAL '15 days');
  
  -- Order item 2: Butachlor 1L x 6 chai
  SELECT id, price, vat_rate INTO pu_id, item_price, item_vat_rate FROM product_units WHERE sku='BUTACHLOR-1L';
  item_qty := 6;
  item_vat_amt := ROUND((item_price * item_qty * item_vat_rate / (100 + item_vat_rate))::numeric, 0);
  INSERT INTO order_items (order_id, product_unit_id, quantity, price, discount_amount, vat_rate, vat_amount)
  VALUES (ord_id, pu_id, item_qty, item_price, 0, item_vat_rate, item_vat_amt);
  
  -- Tạo inventory movement
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'sale', item_qty, 'order_items', currval('order_items_id_seq'), NOW() - INTERVAL '15 days');
  
END $$;

-- Đơn hàng 3: Anh Bảy mua nhiều thuốc BVTV (Completed)
DO $$
DECLARE
  ord_id bigint;
  buyer_uuid uuid;
  pm_id bigint;
  pu_id bigint;
  wh_id bigint;
  item_qty int;
  item_price numeric;
  item_vat_rate numeric;
  item_vat_amt numeric;
BEGIN
  SELECT id INTO buyer_uuid FROM profiles WHERE sort_name='Anh Bảy Sóc Cuôi';
  SELECT id INTO pm_id FROM payment_methods WHERE name='Chuyển khoản ngân hàng';
  SELECT id INTO wh_id FROM warehouses WHERE name='Kho chính' LIMIT 1;
  
  -- Tạo order
  INSERT INTO orders (buyer_id, total_amount, total_vat, discount_total, status, payment_method_id, payment_term, is_online, created_at)
  VALUES (buyer_uuid, 1505000, 136818, 0, 'completed', pm_id, 'prepaid', false, NOW() - INTERVAL '10 days')
  RETURNING id INTO ord_id;
  
  -- Order item 1: Karate 500ml x 3 chai
  SELECT id, price, vat_rate INTO pu_id, item_price, item_vat_rate FROM product_units WHERE sku='KARATE-500ML';
  item_qty := 3;
  item_vat_amt := ROUND((item_price * item_qty * item_vat_rate / (100 + item_vat_rate))::numeric, 0);
  INSERT INTO order_items (order_id, product_unit_id, quantity, price, discount_amount, vat_rate, vat_amount)
  VALUES (ord_id, pu_id, item_qty, item_price, 0, item_vat_rate, item_vat_amt);
  
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'sale', item_qty, 'order_items', currval('order_items_id_seq'), NOW() - INTERVAL '10 days');
  
  -- Order item 2: Ridomil 100g x 5 gói
  SELECT id, price, vat_rate INTO pu_id, item_price, item_vat_rate FROM product_units WHERE sku='RIDOMIL-100G';
  item_qty := 5;
  item_vat_amt := ROUND((item_price * item_qty * item_vat_rate / (100 + item_vat_rate))::numeric, 0);
  INSERT INTO order_items (order_id, product_unit_id, quantity, price, discount_amount, vat_rate, vat_amount)
  VALUES (ord_id, pu_id, item_qty, item_price, 0, item_vat_rate, item_vat_amt);
  
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'sale', item_qty, 'order_items', currval('order_items_id_seq'), NOW() - INTERVAL '10 days');
  
  -- Order item 3: Antracol 1kg x 4 gói
  SELECT id, price, vat_rate INTO pu_id, item_price, item_vat_rate FROM product_units WHERE sku='ANTRACOL-1KG';
  item_qty := 4;
  item_vat_amt := ROUND((item_price * item_qty * item_vat_rate / (100 + item_vat_rate))::numeric, 0);
  INSERT INTO order_items (order_id, product_unit_id, quantity, price, discount_amount, vat_rate, vat_amount)
  VALUES (ord_id, pu_id, item_qty, item_price, 0, item_vat_rate, item_vat_amt);
  
  INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  VALUES (pu_id, wh_id, 'sale', item_qty, 'order_items', currval('order_items_id_seq'), NOW() - INTERVAL '10 days');
  
END $$;

-- Đơn hàng 4: Anh Mười mua máy phun và dụng cụ (Pending)
DO $$
DECLARE
  ord_id bigint;
  buyer_uuid uuid;
  pm_id bigint;
  pu_id bigint;
  item_qty int;
  item_price numeric;
  item_vat_rate numeric;
  item_vat_amt numeric;
BEGIN
  SELECT id INTO buyer_uuid FROM profiles WHERE sort_name='Anh Mười Trà Khúp';
  SELECT id INTO pm_id FROM payment_methods WHERE name='Thanh toán khi nhận hàng (COD)';
  
  -- Tạo order (chưa giao nên không trừ kho)
  INSERT INTO orders (buyer_id, total_amount, total_vat, discount_total, status, payment_method_id, payment_term, is_online, created_at)
  VALUES (buyer_uuid, 7400000, 672727, 0, 'pending', pm_id, 'cod', true, NOW() - INTERVAL '2 days')
  RETURNING id INTO ord_id;
  
  -- Order item 1: Máy phun Honda x 1 cái
  SELECT id, price, vat_rate INTO pu_id, item_price, item_vat_rate FROM product_units WHERE sku='TOOL-SPRAYER-HONDA';
  item_qty := 1;
  item_vat_amt := ROUND((item_price * item_qty * item_vat_rate / (100 + item_vat_rate))::numeric, 0);
  INSERT INTO order_items (order_id, product_unit_id, quantity, price, discount_amount, vat_rate, vat_amount)
  VALUES (ord_id, pu_id, item_qty, item_price, 0, item_vat_rate, item_vat_amt);
  
  -- Order item 2: Bình xịt 16L x 2 cái
  SELECT id, price, vat_rate INTO pu_id, item_price, item_vat_rate FROM product_units WHERE sku='TOOL-SPRAYER-16L';
  item_qty := 2;
  item_vat_amt := ROUND((item_price * item_qty * item_vat_rate / (100 + item_vat_rate))::numeric, 0);
  INSERT INTO order_items (order_id, product_unit_id, quantity, price, discount_amount, vat_rate, vat_amount)
  VALUES (ord_id, pu_id, item_qty, item_price, 0, item_vat_rate, item_vat_amt);
  
END $$;

-- ================================================================================
-- KẾT THÚC SEED DATA
-- ================================================================================
-- Dữ liệu mẫu đã được tạo thành công!
-- Bạn có thể kiểm tra bằng các query sau:
--   SELECT * FROM areas;
--   SELECT * FROM warehouses;
--   SELECT * FROM store_settings;
--   SELECT * FROM payment_methods;
--   SELECT * FROM categories;
--   SELECT * FROM product_units;
--   SELECT * FROM coupons;
--   SELECT * FROM profiles;
--   SELECT * FROM inventory_movements;
--   SELECT * FROM orders JOIN order_items ON orders.id = order_items.order_id;
-- ================================================================================




