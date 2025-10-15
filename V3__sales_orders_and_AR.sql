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
  buyer_id uuid references profiles(id) on delete set null,                  -- Khách hàng mua (link tới profiles)
  total_amount numeric not null,                                             -- Tổng tiền đơn hàng (đã bao gồm VAT)
  total_vat numeric not null default 0,                                      -- Tổng tiền VAT của đơn hàng (sum của vat_amount từ order_items)
  discount_total numeric not null default 0,                                 -- Tổng giảm giá (từ coupon hoặc chiết khấu)
  status order_status not null default 'pending',                            -- Trạng thái: pending, confirmed, shipped, delivered, cancelled
  shipping_method_id bigint references shipping_methods(id) on delete set null, -- Phương thức giao hàng
  payment_method_id bigint references payment_methods(id) on delete set null,   -- Phương thức thanh toán
  coupon_id bigint references coupons(id) on delete set null,                -- Mã giảm giá đã sử dụng
  payment_term payment_term not null default 'prepaid',                      -- Điều kiện thanh toán: prepaid (trả trước), cod (thu tiền khi giao), net_7/15/30 (công nợ)
  einvoice_required boolean not null default false,                          -- Khách yêu cầu xuất hóa đơn điện tử không?
  created_at timestamptz not null default now()                              -- Ngày tạo đơn
);

comment on column orders.total_vat is 'Total VAT amount for the order (sum of vat_amount from order_items).';
comment on column orders.einvoice_required is 'Customer requested e-invoice for this order';

-- INDEX cho orders: tăng tốc truy vấn theo buyer, trạng thái, và ngày tạo
create index if not exists idx_orders_buyer on orders(buyer_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at);

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

-- ================================================================================
-- 3. TABLE: customer_payments (Phiếu thu tiền từ khách hàng)
-- ================================================================================
-- Lưu các lần thu tiền từ khách hàng
-- Một payment có thể phân bổ cho nhiều orders (qua customer_payment_allocations)
create table if not exists customer_payments (
  id bigserial primary key,                                                  -- ID tự tăng
  payer_id uuid not null references profiles(id) on delete restrict,         -- Người trả tiền (khách hàng)
  amount numeric not null,                                                   -- Số tiền thu được
  method_id bigint references payment_methods(id) on delete set null,        -- Phương thức thanh toán (tiền mặt, chuyển khoản...)
  status payment_status not null default 'success',                          -- Trạng thái: success, pending, failed
  paid_at timestamptz,                                                       -- Thời điểm thanh toán thực tế
  provider_txn_id varchar,                                                   -- Mã giao dịch từ cổng thanh toán (VD: VNPay, Momo)
  note text,                                                                 -- Ghi chú thêm
  created_at timestamptz not null default now()                              -- Ngày tạo phiếu thu
);

-- INDEX cho customer_payments: tăng tốc truy vấn theo payer và ngày thanh toán
create index if not exists idx_customer_payments_payer on customer_payments(payer_id);
create index if not exists idx_customer_payments_paid_at on customer_payments(paid_at);

-- ================================================================================
-- 4. TABLE: customer_payment_allocations (Phân bổ thanh toán)
-- ================================================================================
-- Liên kết giữa payment và order - cho biết payment này trả cho order nào, bao nhiêu tiền
-- VD: Khách hàng trả 1 triệu, phân bổ:
--     - 600k cho đơn hàng #101
--     - 400k cho đơn hàng #102
create table if not exists customer_payment_allocations (
  id bigserial primary key,                                                  -- ID tự tăng
  payment_id bigint not null references customer_payments(id) on delete cascade, -- Phiếu thu thuộc về
  order_id bigint not null references orders(id) on delete cascade,          -- Đơn hàng được thanh toán
  allocated_amount numeric not null check (allocated_amount > 0)             -- Số tiền phân bổ cho đơn hàng này
);

-- INDEX cho customer_payment_allocations: tăng tốc truy vấn theo payment và order
create index if not exists idx_cpa_payment on customer_payment_allocations(payment_id);
create index if not exists idx_cpa_order on customer_payment_allocations(order_id);

-- ================================================================================
-- 5. TABLE: customer_adjustments (Điều chỉnh công nợ khách hàng)
-- ================================================================================
-- Lưu các giao dịch tăng/giảm công nợ không phải từ đơn hàng hoặc payment
-- VD: 
--     - Giảm nợ do khách trả hàng (amount âm)
--     - Tăng nợ do tính phí phát sinh (amount dương)
--     - Xóa nợ do khách hàng VIP (amount âm)
create table if not exists customer_adjustments (
  id bigserial primary key,                                                  -- ID tự tăng
  buyer_id uuid not null references profiles(id) on delete restrict,         -- Khách hàng
  order_id bigint references orders(id) on delete set null,                  -- Đơn hàng liên quan (nếu có)
  amount numeric not null,                                                   -- Số tiền điều chỉnh (dương = tăng nợ, âm = giảm nợ)
  reason varchar,                                                            -- Lý do điều chỉnh (VD: "Trả hàng", "Giảm giá thêm", "Xóa nợ")
  created_at timestamptz not null default now()                              -- Ngày điều chỉnh
);

-- INDEX cho customer_adjustments: tăng tốc truy vấn theo buyer và order
create index if not exists idx_cadj_buyer on customer_adjustments(buyer_id);
create index if not exists idx_cadj_order on customer_adjustments(order_id);
