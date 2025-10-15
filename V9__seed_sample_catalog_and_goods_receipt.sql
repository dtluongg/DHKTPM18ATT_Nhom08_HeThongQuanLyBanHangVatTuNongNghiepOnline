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

-- ================================================================================
-- 1. SEED: Dữ liệu cơ bản (payment_methods, shipping_methods, warehouses)
-- ================================================================================
-- Phương thức thanh toán
insert into payment_methods(name) values
  ('COD') on conflict (name) do nothing;                    -- COD: Tiền mặt khi nhận hàng
insert into payment_methods(name) values
  ('Chuyển khoản') on conflict (name) do nothing;           -- Chuyển khoản ngân hàng

-- Phương thức vận chuyển
insert into shipping_methods(name, description) values
  ('Standard', 'Giao tiêu chuẩn')
  on conflict (name) do nothing;                            -- Giao hàng tiêu chuẩn
insert into shipping_methods(name, description) values
  ('Express', 'Giao nhanh')
  on conflict (name) do nothing;                            -- Giao hàng nhanh

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
-- 3. SEED: Thương hiệu (brands)
-- ================================================================================
insert into brands(name, slug, country) values
  ('Phú Mỹ', 'phu-my', 'VN'),        -- Phân bón Phú Mỹ (Việt Nam)
  ('Bayer', 'bayer', 'DE'),           -- Bayer (Đức)
  ('Syngenta', 'syngenta', 'CH');    -- Syngenta (Thụy Sĩ)

-- ================================================================================
-- 4. SEED: Sản phẩm (products)
-- ================================================================================
-- Sản phẩm 1: NPK 16-16-8 Phú Mỹ (Phân bón)
insert into products(category_id, brand_id, name, slug, description, image_url)
select (select id from categories where slug='phan-bon'),
       (select id from brands where slug='phu-my'),
       'NPK 16-16-8 Phú Mỹ','npk-16-16-8-phu-my','Phân bón NPK 16-16-8 phù hợp nhiều loại cây trồng',null;

-- Sản phẩm 2: Đạm Ure Phú Mỹ (Phân bón)
insert into products(category_id, brand_id, name, slug, description, image_url)
select (select id from categories where slug='phan-bon'),
       (select id from brands where slug='phu-my'),
       'Đạm Ure Phú Mỹ','ure-phu-my','Đạm Ure hạt đục, hàm lượng đạm cao',null;

-- Sản phẩm 3: Karate 2.5EC (Thuốc trừ sâu)
insert into products(category_id, brand_id, name, slug, description, image_url)
select (select id from categories where slug='thuoc-bvtv'),
       (select id from brands where slug='bayer'),
       'Karate 2.5EC','karate-2-5ec','Thuốc trừ sâu phổ rộng',null;

-- Sản phẩm 4: Ridomil Gold 68WG (Thuốc trừ bệnh)
insert into products(category_id, brand_id, name, slug, description, image_url)
select (select id from categories where slug='thuoc-bvtv'),
       (select id from brands where slug='syngenta'),
       'Ridomil Gold 68WG','ridomil-gold-68wg','Trị bệnh do nấm Phytophthora, Pythium',null;
-- ================================================================================
-- 5. SEED: Đơn vị sản phẩm (product_units) với giá bán
-- ================================================================================
-- Đơn vị 1: NPK 16-16-8 Phú Mỹ - Bao 25kg @ 450,000đ
insert into product_units(product_id, unit, size_label, short_name, net_qty, uom, price, sku, barcode, stock, is_active)
select (select id from products where slug='npk-16-16-8-phu-my'),'bag','25kg','NPK to',25,'kg', 450000,'NPK-16168-25KG','893PM-NPK-25',0,true;

-- Đơn vị 2: Đạm Ure Phú Mỹ - Bao 50kg @ 520,000đ
insert into product_units(product_id, unit, size_label, short_name, net_qty, uom, price, sku, barcode, stock, is_active)
select (select id from products where slug='ure-phu-my'),'bag','50kg','Ure lớn',50,'kg', 520000,'URE-PM-50KG','893PM-URE-50',0,true;

-- Đơn vị 3: Karate 2.5EC - Chai 100ml @ 65,000đ
insert into product_units(product_id, unit, size_label, short_name, net_qty, uom, price, sku, barcode, stock, is_active)
select (select id from products where slug='karate-2-5ec'),'bottle','100ml','Karate nhỏ',100,'ml', 65000,'KARATE-100ML','BAYER-KRT-100',0,true;

-- Đơn vị 4: Ridomil Gold 68WG - Gói 100g @ 55,000đ
insert into product_units(product_id, unit, size_label, short_name, net_qty, uom, price, sku, barcode, stock, is_active)
select (select id from products where slug='ridomil-gold-68wg'),'pack','100g','Ridomil gói',100,'g', 55000,'RIDOMIL-100G','SYN-RDM-100',0,true;

-- ================================================================================
-- 6. SEED: Nhà cung cấp (supplier) và Phiếu nhập kho (goods_receipt)
-- ================================================================================
-- Tạo 1 nhà cung cấp: Công ty An Phú
-- Sau đó tạo 1 phiếu nhập kho vào kho Main
with s as (
  insert into profiles(email, name, sort_name, phone, address, role)
  values ('ncc.anphu@example.com','Công ty TNHH Vật Tư NN An Phú','Chú An','0909000111','TP. Hồ Chí Minh','supplier')
  returning id
),
wh as (select id from warehouses where name='Main' limit 1)
insert into goods_receipts(supplier_id, warehouse_id, note)
select s.id, wh.id, 'Seed nhập kho đợt 1' from s, wh;

-- ================================================================================
-- 7. SEED: Chi tiết phiếu nhập kho (goods_receipt_items)
-- ================================================================================
-- Nhập 4 sản phẩm vào kho:
--   - 200 bao NPK 16-16-8 25kg
--   - 120 bao Đạm Ure 50kg
--   - 150 chai Karate 100ml
--   - 180 gói Ridomil 100g
-- Trigger sẽ tự động tạo inventory_movements và cập nhật product_units.stock
with r as (select id from goods_receipts order by id desc limit 1)
insert into goods_receipt_items(receipt_id, product_unit_id, quantity) values
  ((select id from r), (select id from product_units where sku='NPK-16168-25KG'), 200),
  ((select id from r), (select id from product_units where sku='URE-PM-50KG'), 120),
  ((select id from r), (select id from product_units where sku='KARATE-100ML'), 150),
  ((select id from r), (select id from product_units where sku='RIDOMIL-100G'), 180);

-- ================================================================================
-- 8. SEED: Hóa đơn nhà cung cấp (supplier_bills)
-- ================================================================================
-- Tạo hóa đơn cho đợt nhập hàng trên
-- Tổng tiền:
--   NPK: 200 x 450,000 = 90,000,000đ
--   Ure: 120 x 520,000 = 62,400,000đ
--   Karate: 150 x 65,000 = 9,750,000đ
--   Ridomil: 180 x 55,000 = 9,900,000đ
--   Subtotal = 172,050,000đ
--   VAT 10% = 17,205,000đ
--   Total = 189,255,000đ
with s as (select id from profiles where email='ncc.anphu@example.com' limit 1),
     pm as (select id from payment_methods where name='Chuyển khoản' limit 1)
insert into supplier_bills(supplier_id, bill_no, bill_date, subtotal, discount_total, tax_total, total_amount, payment_method_id, img_url)
select s.id, 'AP-2024-001', current_date, 172050000, 0, 17205000, 189255000, pm.id, 'https://example.com/invoices/AP-2024-001.jpg'
from s, pm;

-- ================================================================================
-- 9. SEED: Chi tiết hóa đơn nhà cung cấp (supplier_bill_items)
-- ================================================================================
-- Tạo 4 dòng hóa đơn tương ứng với 4 sản phẩm đã nhập
with b as (select id from supplier_bills order by id desc limit 1)
insert into supplier_bill_items(bill_id, product_unit_id, quantity, unit_price, tax_rate, is_stock_item) values
  ((select id from b), (select id from product_units where sku='NPK-16168-25KG'), 200, 450000, 10, true),
  ((select id from b), (select id from product_units where sku='URE-PM-50KG'), 120, 520000, 10, true),
  ((select id from b), (select id from product_units where sku='KARATE-100ML'), 150, 65000, 10, true),
  ((select id from b), (select id from product_units where sku='RIDOMIL-100G'), 180, 55000, 10, true);
