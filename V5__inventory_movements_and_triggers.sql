-- ================================================================================
-- V5: Inventory Movements, Adjustments, and Triggers
--     (Xuất nhập tồn, Điều chỉnh tồn kho, và Triggers tự động)
-- ================================================================================
-- File này định nghĩa:
-- - Bảng inventory_movements (lưu mọi giao dịch xuất/nhập/chuyển kho)
-- - Bảng stock_adjustments và stock_adjustment_items (điều chỉnh tồn kho thủ công)
-- - 3 TRIGGER FUNCTIONS tự động cập nhật product_units.stock khi INSERT/UPDATE/DELETE inventory_movements
-- - 2 TRIGGER FUNCTIONS tự động tạo inventory_movements từ goods_receipt_items và stock_adjustment_items
-- ================================================================================

-- ================================================================================
-- 1. TABLE: inventory_movements (Sổ xuất nhập tồn)
-- ================================================================================
-- Lưu MỌI giao dịch xuất/nhập/chuyển kho
-- Mỗi movement sẽ tự động cập nhật product_units.stock qua trigger
-- Các loại movement (inventory_movement_type):
--   - purchase: nhập hàng từ nhà cung cấp
--   - sale: xuất bán cho khách
--   - return_in: nhập lại (khách trả hàng)
--   - return_out: xuất lại (trả hàng cho nhà cung cấp)
--   - adjustment_pos: điều chỉnh tăng (kiểm kê thừa)
--   - adjustment_neg: điều chỉnh giảm (kiểm kê thiếu)
--   - transfer_in/transfer_out: chuyển kho (chưa dùng trong version này)
--   - conversion_in: chuyển đổi tăng (VD: tách bao 50kg thành 10 túi 5kg)
--   - conversion_out: chuyển đổi giảm (VD: bao 50kg bị tách)
create table if not exists inventory_movements (
  id bigserial primary key,                                                  -- ID tự tăng
  product_unit_id bigint not null references product_units(id) on delete restrict, -- Sản phẩm xuất/nhập
  warehouse_id bigint not null references warehouses(id) on delete restrict, -- Kho nào
  type inventory_movement_type not null,                                     -- Loại giao dịch (xem enum ở V1)
  quantity integer not null check (quantity > 0),                            -- Số lượng (luôn dương, tăng/giảm phụ thuộc vào type)
  ref_table varchar,                                                         -- Tham chiếu đến bảng gốc (VD: 'goods_receipt_items', 'order_items')
  ref_id bigint,                                                             -- ID của record trong bảng gốc
  created_at timestamptz not null default now()                              -- Thời điểm giao dịch
);

-- INDEX cho inventory_movements: tăng tốc truy vấn theo product, warehouse, type, và reference
create index if not exists idx_movements_product on inventory_movements(product_unit_id);
create index if not exists idx_movements_warehouse on inventory_movements(warehouse_id);
create index if not exists idx_movements_type on inventory_movements(type);
create index if not exists idx_movements_ref on inventory_movements(ref_table, ref_id);

-- ================================================================================
-- 2. TABLE: stock_adjustments (Phiếu điều chỉnh tồn kho)
-- ================================================================================
-- Lưu các phiếu điều chỉnh tồn kho thủ công (VD: kiểm kê, hư hỏng, mất mát)
create table if not exists stock_adjustments (
  id bigserial primary key,                                                  -- ID tự tăng
  warehouse_id bigint not null references warehouses(id) on delete restrict, -- Kho điều chỉnh
  reason varchar,                                                            -- Lý do (VD: "Kiểm kê định kỳ", "Hàng hư hỏng")
  created_at timestamptz not null default now()                              -- Ngày điều chỉnh
);

-- ================================================================================
-- 3. TABLE: stock_adjustment_items (Chi tiết điều chỉnh tồn kho)
-- ================================================================================
-- Lưu từng dòng sản phẩm trong phiếu điều chỉnh
-- VD: Phiếu điều chỉnh #789 có:
--     - Phân NPK 50kg: +5 (kiểm kê thừa 5 bao)
--     - Thuốc trừ sâu 1L: -3 (kiểm kê thiếu 3 chai)
create table if not exists stock_adjustment_items (
  id bigserial primary key,                                                  -- ID tự tăng
  adjustment_id bigint not null references stock_adjustments(id) on delete cascade, -- Phiếu điều chỉnh
  product_unit_id bigint not null references product_units(id) on delete restrict, -- Sản phẩm điều chỉnh
  diff_qty integer not null                                                  -- Chênh lệch (dương = thừa, âm = thiếu)
);
-- ================================================================================
-- 4. TRIGGER FUNCTION: apply_product_unit_stock_on_movement_ins()
-- ================================================================================
-- Tự động cập nhật product_units.stock khi INSERT movement mới
-- Logic:
--   - transfer_in/transfer_out: bỏ qua (chưa dùng)
--   - sale, return_out, adjustment_neg, conversion_out: GIẢM stock (-)
--   - purchase, return_in, adjustment_pos, conversion_in: TĂNG stock (+)
create or replace function apply_product_unit_stock_on_movement_ins()
returns trigger language plpgsql as $$
begin
  -- Bỏ qua transfer (chưa dùng trong version này)
  if NEW.type in ('transfer_in','transfer_out') then
    return NEW;
  end if;
  -- Các loại GIẢM tồn: xuất bán, trả hàng cho NCC, kiểm kê thiếu, chuyển đổi giảm
  if NEW.type in ('sale','return_out','adjustment_neg','conversion_out') then
    update product_units set stock = stock - NEW.quantity where id = NEW.product_unit_id;
  -- Các loại TĂNG tồn: nhập hàng, khách trả hàng, kiểm kê thừa, chuyển đổi tăng
  else
    update product_units set stock = stock + NEW.quantity where id = NEW.product_unit_id;
  end if;
  return NEW;
end $$;

-- ================================================================================
-- 5. TRIGGER FUNCTION: apply_product_unit_stock_on_movement_upd()
-- ================================================================================
-- Tự động cập nhật product_units.stock khi UPDATE movement
-- Logic: hoàn nguyên stock theo OLD, sau đó áp dụng lại theo NEW
create or replace function apply_product_unit_stock_on_movement_upd()
returns trigger language plpgsql as $$
begin
  -- Bước 1: Hoàn nguyên stock theo OLD record (đảo ngược logic)
  if OLD.type not in ('transfer_in','transfer_out') then
    if OLD.type in ('sale','return_out','adjustment_neg','conversion_out') then
      -- OLD là giảm -> hoàn nguyên = tăng lại
      update product_units set stock = stock + OLD.quantity where id = OLD.product_unit_id;
    else
      -- OLD là tăng -> hoàn nguyên = giảm lại
      update product_units set stock = stock - OLD.quantity where id = OLD.product_unit_id;
    end if;
  end if;
  -- Bước 2: Áp dụng stock theo NEW record
  if NEW.type not in ('transfer_in','transfer_out') then
    if NEW.type in ('sale','return_out','adjustment_neg','conversion_out') then
      -- NEW là giảm
      update product_units set stock = stock - NEW.quantity where id = NEW.product_unit_id;
    else
      -- NEW là tăng
      update product_units set stock = stock + NEW.quantity where id = NEW.product_unit_id;
    end if;
  end if;
  return NEW;
end $$;

-- ================================================================================
-- 6. TRIGGER FUNCTION: apply_product_unit_stock_on_movement_del()
-- ================================================================================
-- Tự động cập nhật product_units.stock khi DELETE movement
-- Logic: hoàn nguyên stock (đảo ngược logic của movement bị xóa)
create or replace function apply_product_unit_stock_on_movement_del()
returns trigger language plpgsql as $$
begin
  -- Bỏ qua transfer (chưa dùng)
  if OLD.type in ('transfer_in','transfer_out') then
    return OLD;
  end if;
  -- OLD là giảm -> hoàn nguyên = tăng lại
  if OLD.type in ('sale','return_out','adjustment_neg','conversion_out') then
    update product_units set stock = stock + OLD.quantity where id = OLD.product_unit_id;
  -- OLD là tăng -> hoàn nguyên = giảm lại
  else
    update product_units set stock = stock - OLD.quantity where id = OLD.product_unit_id;
  end if;
  return OLD;
end $$;
-- ================================================================================
-- 7. ĐĂNG KÝ TRIGGERS: Tự động cập nhật stock khi INSERT/UPDATE/DELETE movements
-- ================================================================================
-- Trigger 1: Khi INSERT movement mới -> cập nhật stock
drop trigger if exists trg_movements_after_ins on inventory_movements;
create trigger trg_movements_after_ins
after insert on inventory_movements
for each row execute function apply_product_unit_stock_on_movement_ins();

-- Trigger 2: Khi UPDATE movement -> hoàn nguyên OLD rồi áp dụng NEW
drop trigger if exists trg_movements_after_upd on inventory_movements;
create trigger trg_movements_after_upd
after update on inventory_movements
for each row execute function apply_product_unit_stock_on_movement_upd();

-- Trigger 3: Khi DELETE movement -> hoàn nguyên stock
drop trigger if exists trg_movements_after_del on inventory_movements;
create trigger trg_movements_after_del
after delete on inventory_movements
for each row execute function apply_product_unit_stock_on_movement_del();

-- ================================================================================
-- 8. TRIGGER FUNCTION: ins_movement_from_receipt_item()
-- ================================================================================
-- Tự động tạo inventory_movement type='purchase' khi INSERT goods_receipt_items
-- VD: Nhập 100 bao phân NPK 50kg từ NCC
--     -> Tự động tạo movement type='purchase', quantity=100
--     -> Trigger trg_movements_after_ins sẽ tăng stock lên 100
create or replace function ins_movement_from_receipt_item()
returns trigger language plpgsql as $$
declare
  wh_id bigint;
begin
  -- Lấy warehouse_id từ goods_receipts
  select warehouse_id into wh_id from goods_receipts where id = NEW.receipt_id;
  -- Tạo movement type='purchase'
  insert into inventory_movements(product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  values (NEW.product_unit_id, wh_id, 'purchase', NEW.quantity, 'goods_receipt_items', NEW.id, now());
  return NEW;
end $$;

drop trigger if exists trg_gr_items_after_ins on goods_receipt_items;
create trigger trg_gr_items_after_ins
after insert on goods_receipt_items
for each row execute function ins_movement_from_receipt_item();

-- ================================================================================
-- 9. TRIGGER FUNCTION: ins_movement_from_adjustment_item()
-- ================================================================================
-- Tự động tạo inventory_movement khi INSERT stock_adjustment_items
-- VD: Kiểm kê phát hiện:
--     - Thừa 5 bao phân (diff_qty = +5) -> movement type='adjustment_pos', quantity=5
--     - Thiếu 3 chai thuốc (diff_qty = -3) -> movement type='adjustment_neg', quantity=3
create or replace function ins_movement_from_adjustment_item()
returns trigger language plpgsql as $$
declare
  wh_id bigint;
  qty integer;
  mtype inventory_movement_type;
begin
  -- Lấy warehouse_id từ stock_adjustments
  select warehouse_id into wh_id from stock_adjustments where id = NEW.adjustment_id;
  -- Bỏ qua nếu diff_qty = 0
  if NEW.diff_qty = 0 then return NEW; end if;
  -- diff_qty dương = thừa -> adjustment_pos
  if NEW.diff_qty > 0 then
    mtype := 'adjustment_pos'; qty := NEW.diff_qty;
  -- diff_qty âm = thiếu -> adjustment_neg
  else
    mtype := 'adjustment_neg'; qty := abs(NEW.diff_qty);
  end if;
  -- Tạo movement tương ứng
  insert into inventory_movements(product_unit_id, warehouse_id, type, quantity, ref_table, ref_id, created_at)
  values (NEW.product_unit_id, wh_id, mtype, qty, 'stock_adjustment_items', NEW.id, now());
  return NEW;
end $$;

drop trigger if exists trg_sai_after_ins on stock_adjustment_items;
create trigger trg_sai_after_ins
after insert on stock_adjustment_items
for each row execute function ins_movement_from_adjustment_item();
