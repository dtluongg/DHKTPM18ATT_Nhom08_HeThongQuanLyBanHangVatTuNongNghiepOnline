-- ================================================================================
-- V3: Sales Orders & AR (Đơn hàng bán và Khoản phải thu)
-- ================================================================================
-- File này định nghĩa:
-- - Đơn hàng bán (orders) với thông tin thanh toán và giao hàng
-- - Chi tiết đơn hàng (order_items) với VAT tracking
-- - Phiếu thu tiền (customer_payments)
-- - Phân bổ thanh toán (customer_payment_allocations) - liên kết payment với order
-- - Điều chỉnh công nợ (customer_adjustments) - tăng/giảm công nợ khách hàng
-- ================================================================================

-- ================================================================================
-- 1. TABLE: orders (Đơn hàng bán)
-- ================================================================================
-- Lưu thông tin đơn hàng từ khách hàng
-- Một đơn hàng có nhiều order_items (chi tiết sản phẩm)
create table if not exists orders (
  id bigserial primary key,                                                  -- ID tự tăng
  order_no varchar(30) unique not null,                                      -- 30 để chứa số dài hơn
  buyer_id uuid references profiles(id) on delete set null,                  -- Khách hàng mua (link tới profiles)
  total_amount numeric not null,                                             -- Tổng tiền đơn hàng (đã bao gồm VAT)
  total_vat numeric not null default 0,                                      -- Tổng tiền VAT của đơn hàng (sum của vat_amount từ order_items)
  discount_total numeric not null default 0,                                 -- Tổng giảm giá (từ coupon hoặc chiết khấu)
  status order_status not null default 'pending',                            -- Trạng thái: pending, confirmed, shipped, completed, cancelled
  payment_method_id bigint references payment_methods(id) on delete set null,   -- Phương thức thanh toán
  coupon_id bigint references coupons(id) on delete set null,                -- Mã giảm giá đã sử dụng
  payment_term payment_term not null default 'prepaid',                      -- Điều kiện thanh toán: prepaid (trả trước), cod (thu tiền khi giao), credit (công nợ)
  is_online boolean not null default true,                                   -- Kênh bán hàng: true = Online, false = POS
  einvoice_required boolean not null default false,                          -- Khách yêu cầu xuất hóa đơn điện tử không?
  created_at timestamp not null default now()                              -- Ngày tạo đơn
);

-- TRIGGER FUNCTION: Tự động tạo order_no theo format ORD-YYYYMMDD-XXXX
create or replace function generate_order_no()
returns trigger as $$
declare
  date_str varchar(8);
  seq_num integer;
  padding integer;
  new_no varchar(20);
begin
  date_str := to_char(current_date, 'YYYYMMDD');
  
  -- Đếm số đơn trong ngày
  select coalesce(
    max(cast(regexp_replace(order_no, '^ORD-\d{8}-', '') as integer)), 
    0
  ) + 1
  into seq_num
  from orders
  where order_no like 'ORD-' || date_str || '-%';
  
  -- Tự động tăng padding khi cần
  if seq_num <= 9999 then
    padding := 4;  -- ORD-20251016-0001
  elsif seq_num <= 99999 then
    padding := 5;  -- ORD-20251016-10000
  else
    padding := 6;  -- ORD-20251016-100000
  end if;
  
  new_no := 'ORD-' || date_str || '-' || lpad(seq_num::text, padding, '0');
  new.order_no := new_no;
  
  return new;
end;
$$ language plpgsql;

-- TRIGGER: Gọi function trước khi INSERT
create trigger trg_orders_generate_no
before insert on orders
for each row
when (new.order_no is null or new.order_no = '')
execute function generate_order_no();

-- INDEX cho orders: tăng tốc truy vấn theo order_no, buyer, trạng thái, và ngày tạo
create index if not exists idx_orders_order_no on orders(order_no);
create index if not exists idx_orders_buyer on orders(buyer_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at);
create index if not exists idx_orders_is_online on orders(is_online);

-- ================================================================================
-- 2. TABLE: order_items (Chi tiết đơn hàng)
-- ================================================================================
-- Lưu từng dòng sản phẩm trong đơn hàng
-- VD: Đơn hàng #123 có 3 items:
--     - 10 bao phân NPK 50kg @ 500,000đ
--     - 5 chai thuốc trừ sâu 1L @ 120,000đ
--     - 2 hộp thuốc diệt cỏ 500ml @ 85,000đ
create table if not exists order_items (
  id bigserial primary key,                                                  -- ID tự tăng
  order_id bigint not null references orders(id) on delete cascade,          -- Đơn hàng thuộc về
  product_unit_id bigint not null references product_units(id) on delete restrict, -- Đơn vị sản phẩm bán (VD: bao 50kg)
  quantity integer not null,                                                 -- Số lượng bán
  price numeric not null,                                                    -- Giá bán (đã bao gồm VAT)
  discount_amount numeric not null default 0,                                -- Giảm giá trên dòng này (nếu có)
  vat_rate numeric,                                                          -- % VAT tại thời điểm bán (snapshot từ products.vat_rate)
  vat_amount numeric                                                         -- Tiền VAT tính được (tách ra từ giá đã bao gồm VAT)
);

comment on column order_items.vat_rate is 'Snapshot of product VAT rate (%) at sale time.';
comment on column order_items.vat_amount is 'Per-line VAT amount (derived from VAT-included price).';

-- INDEX cho order_items: tăng tốc truy vấn theo order và product_unit
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_order_items_product_unit on order_items(product_unit_id);


-- 2. TABLE: warehouses (Kho hàng)
-- ================================================================================
-- Lưu thông tin các kho hàng/địa điểm lưu trữ
create table if not exists warehouses (
  id bigserial primary key,           -- ID tự tăng
  name varchar not null,              -- Tên kho (VD: "Kho chính", "Kho chi nhánh Bình Tân")
  address text                        -- Địa chỉ kho
);

