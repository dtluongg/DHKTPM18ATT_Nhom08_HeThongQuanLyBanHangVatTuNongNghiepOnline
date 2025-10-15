-- ================================================================================
-- V4: Goods Receipts & Supplier Bills
--     (Phiếu nhập hàng và Hóa đơn nhà cung cấp)
-- ================================================================================
-- File này định nghĩa:
-- - Kho hàng (warehouses)
-- - Phiếu nhập hàng (goods_receipts) - không cần Purchase Order
-- - Chi tiết phiếu nhập (goods_receipt_items)
-- - Hóa đơn nhà cung cấp (supplier_bills) - Thanh toán ngay và đủ
-- - Chi tiết hóa đơn (supplier_bill_items)
-- 
-- Lưu ý: Mô hình đơn giản - Trả tiền nhà cung cấp ngay khi nhận hóa đơn,
--        không quản lý công nợ phức tạp.
-- ================================================================================

-- ================================================================================
-- 1. TABLE: warehouses (Kho hàng)
-- ================================================================================
-- Lưu thông tin các kho hàng/địa điểm lưu trữ
create table if not exists warehouses (
  id bigserial primary key,           -- ID tự tăng
  name varchar not null,              -- Tên kho (VD: "Kho chính", "Kho chi nhánh Bình Tân")
  address text                        -- Địa chỉ kho
);

-- ================================================================================
-- 2. TABLE: goods_receipts (Phiếu nhập hàng)
-- ================================================================================
-- Lưu thông tin phiếu nhập hàng từ nhà cung cấp
-- Mô hình đơn giản: không cần Purchase Order, nhập hàng trực tiếp
create table if not exists goods_receipts (
  id bigserial primary key,                                                  -- ID tự tăng
  supplier_id uuid not null references profiles(id) on delete restrict,      -- Nhà cung cấp
  warehouse_id bigint not null references warehouses(id) on delete restrict, -- Nhập vào kho nào
  received_at timestamptz not null default now(),                            -- Thời điểm nhận hàng
  note text                                                                  -- Ghi chú (VD: "Hàng đầy đủ", "Thiếu 2 thùng")
);

-- INDEX cho goods_receipts: tăng tốc truy vấn theo supplier và warehouse
create index if not exists idx_goods_receipts_supplier on goods_receipts(supplier_id);
create index if not exists idx_goods_receipts_warehouse on goods_receipts(warehouse_id);

-- ================================================================================
-- 3. TABLE: goods_receipt_items (Chi tiết phiếu nhập hàng)
-- ================================================================================
-- Lưu từng dòng sản phẩm trong phiếu nhập
-- VD: Phiếu nhập #456 có:
--     - 100 bao phân NPK 50kg
--     - 50 chai thuốc trừ sâu 1L
create table if not exists goods_receipt_items (
  id bigserial primary key,                                                  -- ID tự tăng
  receipt_id bigint not null references goods_receipts(id) on delete cascade, -- Phiếu nhập thuộc về
  product_unit_id bigint not null references product_units(id) on delete restrict, -- Sản phẩm nhập (đơn vị)
  quantity integer not null check (quantity > 0)                             -- Số lượng nhập
);

-- INDEX cho goods_receipt_items: tăng tốc truy vấn theo receipt và product_unit
create index if not exists idx_gr_items_receipt on goods_receipt_items(receipt_id);
create index if not exists idx_gr_items_product_unit on goods_receipt_items(product_unit_id);
-- ================================================================================
-- 4. TABLE: supplier_bills (Hóa đơn nhà cung cấp - Thanh toán ngay)
-- ================================================================================
-- Lưu hóa đơn mua hàng từ nhà cung cấp
-- Model đơn giản: Trả tiền ngay và đủ khi nhận hóa đơn, không có công nợ
create table if not exists supplier_bills (
  id bigserial primary key,                                                  -- ID tự tăng
  supplier_id uuid not null references profiles(id) on delete restrict,      -- Nhà cung cấp
  bill_no varchar,                                                           -- Số hóa đơn (từ nhà cung cấp)
  bill_date date not null,                                                   -- Ngày hóa đơn
  subtotal numeric not null,                                                 -- Tổng tiền trước giảm giá và thuế
  discount_total numeric not null default 0,                                 -- Tổng giảm giá
  tax_total numeric not null default 0,                                      -- Tổng thuế VAT
  total_amount numeric not null,                                             -- Tổng tiền phải trả (sau giảm giá + thuế)
  payment_method_id bigint references payment_methods(id) on delete set null, -- Phương thức thanh toán
  paid_at timestamptz not null default now(),                                -- Thời điểm thanh toán
  img_url text,                                                              -- Link ảnh chụp hóa đơn từ nhà cung cấp
  created_at timestamptz not null default now()                              -- Ngày tạo bill trong hệ thống
);

comment on column supplier_bills.img_url is 'Image URL/path of supplier invoice photo for reference';

-- INDEX cho supplier_bills: tăng tốc truy vấn theo supplier và ngày
create index if not exists idx_supplier_bills_supplier on supplier_bills(supplier_id);
create index if not exists idx_supplier_bills_dates on supplier_bills(bill_date, paid_at);

-- ================================================================================
-- 5. TABLE: supplier_bill_items (Chi tiết hóa đơn nhà cung cấp)
-- ================================================================================
-- Lưu từng dòng chi phí/sản phẩm trong hóa đơn
-- Có thể là:
--   - Hàng hóa nhập kho (is_stock_item = true, có product_unit_id)
--   - Chi phí khác (is_stock_item = false, VD: phí vận chuyển, phí bốc xếp)
create table if not exists supplier_bill_items (
  id bigserial primary key,                                                  -- ID tự tăng
  bill_id bigint not null references supplier_bills(id) on delete cascade,   -- Hóa đơn thuộc về
  product_unit_id bigint null references product_units(id) on delete set null, -- Sản phẩm (nếu là hàng hóa)
  description text,                                                          -- Mô tả (VD: "Phí vận chuyển", "Chi phí bốc xếp")
  quantity numeric not null default 1,                                       -- Số lượng
  uom varchar,                                                               -- Đơn vị tính (nếu không có product_unit_id)
  unit_price numeric not null,                                               -- Đơn giá
  line_discount numeric not null default 0,                                  -- Giảm giá trên dòng này
  tax_rate numeric not null default 0,                                       -- % thuế VAT
  is_stock_item boolean not null default true                                -- true = hàng hóa nhập kho, false = chi phí khác
);

-- INDEX cho supplier_bill_items: tăng tốc truy vấn theo bill và product_unit
create index if not exists idx_sbill_items_bill on supplier_bill_items(bill_id);
create index if not exists idx_sbill_items_product_unit on supplier_bill_items(product_unit_id);
