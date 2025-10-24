-- ================================================================================
-- V7: Store Settings, Views and Reports
--     (Cài đặt cửa hàng, Views báo cáo và In ấn)
-- ================================================================================
-- File này định nghĩa:
-- - 2 VIEW báo cáo chính: stock_on_hand, ar_balance_per_customer
-- - TABLE store_settings (thông tin cửa hàng)
-- - 6 VIEW để in ấn: invoice_print_*, goods_issue_print_*, gr_print_*
-- 
-- Lưu ý: Không có báo cáo công nợ nhà cung cấp (AP) vì mô hình thanh toán đơn giản
--        (trả tiền nhà cung cấp ngay khi nhận hóa đơn)
-- ================================================================================



-- ================================================================================
-- 3. TABLE: store_settings (Cài đặt cửa hàng)
-- ================================================================================
-- Lưu thông tin cửa hàng/doanh nghiệp
-- Bảng này chỉ có 1 dòng duy nhất
create table if not exists store_settings (
  id bigserial primary key,                                                  -- ID tự tăng
  store_name varchar not null,                                                  -- Tên cửa hàng (hiển thị)
  legal_name varchar,                                                           -- Tên pháp lý (trên giấy phép)
  phone varchar,                                                                -- Số điện thoại
  email varchar,                                                                -- Email
  address text,                                                              -- Địa chỉ
  tax_id varchar,                                                               -- Mã số thuế
  default_warehouse_id bigint references warehouses(id) on delete set null,  -- Kho mặc định
  created_at timestamp not null default now(),                             -- Ngày tạo
  updated_at timestamp not null default now()                              -- Ngày cập nhật
);








-- ================================================================================
-- 5. VIEW: invoice_print_header (Header hóa đơn bán lẻ - để in)
-- ================================================================================
-- Lấy thông tin header của hóa đơn bán (Invoice)
-- Bao gồm: thông tin đơn hàng, khách hàng, và cửa hàng
-- Dùng để in hóa đơn cho khách
create or replace view invoice_print_header as
with ss as (select * from store_settings order by id desc limit 1)
select
  o.id as order_id,                          -- ID đơn hàng
  o.order_no,                                -- Số đơn hàng
  o.created_at as order_date,                -- Ngày đơn hàng
  o.status,                                  -- Trạng thái (enum)
  o.status::text as status_label,            -- Trạng thái (text)
  o.payment_term,                            -- Điều kiện thanh toán (enum)
  o.payment_term::text as payment_term_label, -- Điều kiện thanh toán (text)
  o.total_amount,                            -- Tổng tiền (bao gồm VAT)
  o.total_vat,                               -- Tổng tiền VAT
  o.discount_total,                          -- Tổng giảm giá
  (o.total_amount - o.discount_total) as net_total, -- Tổng tiền thực trả
  p.name as buyer_name,                      -- Tên khách hàng
  p.sort_name as buyer_sort_name,            -- Tên viết tắt khách hàng
  p.phone as buyer_phone,                    -- SĐT khách hàng
  p.address as buyer_address,                -- Địa chỉ khách hàng
  ss.store_name,                             -- Tên cửa hàng
  ss.address as store_address,               -- Địa chỉ cửa hàng
  ss.phone as store_phone,                   -- SĐT cửa hàng
  ss.email as store_email,                   -- Email cửa hàng
  ss.tax_id as store_tax_id                  -- Mã số thuế cửa hàng
from orders o
left join profiles p on p.id = o.buyer_id
left join ss on true;

-- ================================================================================
-- 6. VIEW: invoice_print_lines (Chi tiết hóa đơn bán lẻ - để in)
-- ================================================================================
-- Lấy các dòng sản phẩm trong hóa đơn bán
-- Bao gồm: STT, SKU, tên SP, quy cách, số lượng, giá, giảm giá, thành tiền
create or replace view invoice_print_lines as
select
  oi.order_id,                                                           -- ID đơn hàng
  row_number() over (partition by oi.order_id order by oi.id) as line_no, -- STT dòng
  pu.sku,                                                                -- Mã SKU
  pu.name as product_units_name,                                               -- Tên sản phẩm
  oi.quantity,                                                           -- Số lượng
  oi.price,                                                              -- Đơn giá
  oi.discount_amount,                                                    -- Giảm giá
  (oi.quantity * oi.price - oi.discount_amount) as line_total           -- Thành tiền
from order_items oi
join product_units pu on pu.id = oi.product_unit_id;

