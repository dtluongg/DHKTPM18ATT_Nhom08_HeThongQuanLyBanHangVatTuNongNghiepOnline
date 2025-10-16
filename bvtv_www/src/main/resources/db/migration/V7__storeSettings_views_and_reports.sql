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
-- 1. VIEW: stock_on_hand (Tồn kho hiện tại)
-- ================================================================================
-- Tính tồn kho theo từng sản phẩm và kho dựa trên inventory_movements
-- Logic:
--   - Các loại TĂNG (purchase, return_in, adjustment_pos, transfer_in, conversion_in): +quantity
--   - Các loại GIẢM (sale, return_out, adjustment_neg, transfer_out, conversion_out): -quantity
-- Kết quả: qty = tổng tồn kho hiện tại
create or replace view stock_on_hand as
select
  m.product_unit_id,                 -- Sản phẩm (đơn vị)
  m.warehouse_id,                    -- Kho
  sum(case
        when m.type in ('purchase','return_in','adjustment_pos','transfer_in','conversion_in') then m.quantity
        when m.type in ('sale','return_out','adjustment_neg','transfer_out','conversion_out') then -m.quantity
        else 0
      end) as qty                    -- Tồn kho hiện tại
from inventory_movements m
group by m.product_unit_id, m.warehouse_id;

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
  currency char(3) not null default 'VND',                                   -- Tiền tệ (VND, USD...)
  locale varchar not null default 'vi-VN',                                      -- Ngôn ngữ/vùng miền
  created_at timestamptz not null default now(),                             -- Ngày tạo
  updated_at timestamptz not null default now()                              -- Ngày cập nhật
);

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

-- ================================================================================
-- 7. VIEW: goods_issue_print_header (Header phiếu xuất kho - để in)
-- ================================================================================
-- Lấy thông tin header của phiếu xuất kho (theo đơn bán)
-- Bao gồm: thông tin xuất kho, người nhận, và cửa hàng
-- Dùng để in phiếu xuất kho khi giao hàng
create or replace view goods_issue_print_header as
with ss as (select * from store_settings order by id desc limit 1)
select
  o.id as order_id,                          -- ID đơn hàng
  o.order_no,                                -- Số đơn hàng
  o.created_at as issue_date,                -- Ngày xuất kho
  p.name as receiver_name,                   -- Tên người nhận
  p.sort_name as receiver_sort_name,         -- Tên viết tắt người nhận
  p.phone as receiver_phone,                 -- SĐT người nhận
  p.address as receiver_address,             -- Địa chỉ người nhận
  ss.store_name,                             -- Tên cửa hàng
  ss.address as store_address,               -- Địa chỉ cửa hàng
  ss.phone as store_phone                    -- SĐT cửa hàng
from orders o
left join profiles p on p.id = o.buyer_id
left join ss on true;

-- ================================================================================
-- 8. VIEW: goods_issue_print_lines (Chi tiết phiếu xuất kho - để in)
-- ================================================================================
-- Lấy các dòng sản phẩm xuất kho
-- Bao gồm: STT, SKU, tên SP, quy cách, số lượng (không có giá)
create or replace view goods_issue_print_lines as
select
  oi.order_id,                                                           -- ID đơn hàng
  row_number() over (partition by oi.order_id order by oi.id) as line_no, -- STT dòng
  pu.sku,                                                                -- Mã SKU
  pu.name as product_units_name,                                               -- Tên sản phẩm
  oi.quantity                                                            -- Số lượng xuất
from order_items oi
join product_units pu on pu.id = oi.product_unit_id;




