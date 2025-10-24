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
  created_at timestamp not null default now()                              -- Thời điểm giao dịch
);

-- INDEX cho inventory_movements: tăng tốc truy vấn theo product, warehouse, type, và reference
create index if not exists idx_movements_product on inventory_movements(product_unit_id);
create index if not exists idx_movements_warehouse on inventory_movements(warehouse_id);
create index if not exists idx_movements_type on inventory_movements(type);
create index if not exists idx_movements_ref on inventory_movements(ref_table, ref_id);


-- ================================================================================
-- 4. TRIGGER FUNCTION: apply_product_unit_stock_on_movement_ins()
-- ================================================================================
-- Tự động cập nhật product_units.stock khi INSERT movement mới
-- Logic:
--   - transfer_in/transfer_out: bỏ qua (k trừ stock)
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


