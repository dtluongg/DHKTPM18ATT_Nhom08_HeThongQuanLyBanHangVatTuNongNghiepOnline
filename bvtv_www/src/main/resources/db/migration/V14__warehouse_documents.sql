-- ================================================================================
-- V14: Warehouse Documents (Phiếu kho)
-- ================================================================================
-- File này bổ sung các bảng phiếu kho còn thiếu:
-- 1. Phiếu Nhập Hàng (goods_receipts) - PNH
-- 2. Phiếu Trả Hàng của Khách (customer_returns) - PTH
-- 3. Phiếu Trả Hàng cho NCC (supplier_returns) - PTHNCC
-- 4. Phiếu Kiểm Kê (stock_adjustments) - PKK
-- 5. Phiếu Chuyển Kho (stock_transfers) - PCK
-- 6. Phiếu Chuyển Đổi (product_conversions) - PCD
-- ================================================================================

-- ================================================================================
-- 1. PHIẾU NHẬP HÀNG (Goods Receipt - PURCHASE)
-- ================================================================================

-- Bảng: goods_receipts (Phiếu nhập hàng từ NCC)
CREATE TABLE IF NOT EXISTS goods_receipts (
  id BIGSERIAL PRIMARY KEY,
  receipt_no VARCHAR(30) UNIQUE NOT NULL,                                    -- PNH-YYYYMMDD-XXXX
  supplier_id UUID REFERENCES profiles(id) ON DELETE SET NULL,               -- Nhà cung cấp
  warehouse_id BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT, -- Nhập vào kho nào
  total_amount NUMERIC NOT NULL DEFAULT 0,                                   -- Tổng tiền hàng (chưa bao gồm VAT)
  total_vat NUMERIC NOT NULL DEFAULT 0,                                      -- Tổng tiền VAT
  payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID','PARTIAL','PAID')),
  notes TEXT,                                                                -- Ghi chú
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','CONFIRMED','CANCELLED')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,                -- Người tạo
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bảng: goods_receipt_items (Chi tiết phiếu nhập)
CREATE TABLE IF NOT EXISTS goods_receipt_items (
  id BIGSERIAL PRIMARY KEY,
  receipt_id BIGINT NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
  product_unit_id BIGINT NOT NULL REFERENCES product_units(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),                            -- Số lượng nhập
  unit_cost NUMERIC NOT NULL CHECK (unit_cost >= 0),                         -- Giá nhập/đơn vị
  line_total NUMERIC GENERATED ALWAYS AS (quantity * unit_cost) STORED,     -- Thành tiền
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- TRIGGER FUNCTION: Tự động sinh mã PNH-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_goods_receipt_no()
RETURNS TRIGGER AS $$
DECLARE
  date_str VARCHAR(8);
  seq_num INTEGER;
  padding INTEGER;
  new_no VARCHAR(30);
BEGIN
  date_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  -- Đếm số phiếu trong ngày
  SELECT COALESCE(
    MAX(CAST(REGEXP_REPLACE(receipt_no, '^PNH-\d{8}-', '') AS INTEGER)), 
    0
  ) + 1
  INTO seq_num
  FROM goods_receipts
  WHERE receipt_no LIKE 'PNH-' || date_str || '-%';
  
  -- Tự động tăng padding khi cần
  IF seq_num <= 9999 THEN
    padding := 4;
  ELSIF seq_num <= 99999 THEN
    padding := 5;
  ELSE
    padding := 6;
  END IF;
  
  new_no := 'PNH-' || date_str || '-' || LPAD(seq_num::TEXT, padding, '0');
  NEW.receipt_no := new_no;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Đăng ký trigger
DROP TRIGGER IF EXISTS trg_goods_receipts_generate_no ON goods_receipts;
CREATE TRIGGER trg_goods_receipts_generate_no
BEFORE INSERT ON goods_receipts
FOR EACH ROW
WHEN (NEW.receipt_no IS NULL OR NEW.receipt_no = '')
EXECUTE FUNCTION generate_goods_receipt_no();

-- TRIGGER FUNCTION: Tự động tạo inventory_movements khi INSERT goods_receipt_items
CREATE OR REPLACE FUNCTION create_movement_from_goods_receipt_item()
RETURNS TRIGGER AS $$
DECLARE
  wh_id BIGINT;
  gr_status VARCHAR(20);
BEGIN
  -- Lấy warehouse_id và status từ goods_receipts
  SELECT warehouse_id, status INTO wh_id, gr_status
  FROM goods_receipts
  WHERE id = NEW.receipt_id;
  
  -- Chỉ tạo movement nếu phiếu đã CONFIRMED
  IF gr_status = 'CONFIRMED' THEN
    INSERT INTO inventory_movements (
      product_unit_id, warehouse_id, type, quantity, ref_table, ref_id
    ) VALUES (
      NEW.product_unit_id, wh_id, 'PURCHASE', NEW.quantity, 'goods_receipt_items', NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Đăng ký trigger
DROP TRIGGER IF EXISTS trg_goods_receipt_items_create_movement ON goods_receipt_items;
CREATE TRIGGER trg_goods_receipt_items_create_movement
AFTER INSERT ON goods_receipt_items
FOR EACH ROW
EXECUTE FUNCTION create_movement_from_goods_receipt_item();

-- INDEX
CREATE INDEX IF NOT EXISTS idx_goods_receipts_receipt_no ON goods_receipts(receipt_no);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_supplier ON goods_receipts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_warehouse ON goods_receipts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_status ON goods_receipts(status);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_receipt ON goods_receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_product ON goods_receipt_items(product_unit_id);


-- ================================================================================
-- 2. PHIẾU TRẢ HÀNG CỦA KHÁCH (Customer Return - RETURN_IN)
-- ================================================================================

-- Bảng: customer_returns (Khách trả hàng)
CREATE TABLE IF NOT EXISTS customer_returns (
  id BIGSERIAL PRIMARY KEY,
  return_no VARCHAR(30) UNIQUE NOT NULL,                                     -- PTH-YYYYMMDD-XXXX
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,                  -- Trả từ đơn hàng nào
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,               -- Khách hàng
  warehouse_id BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT, -- Nhập lại vào kho nào
  total_refund NUMERIC NOT NULL DEFAULT 0,                                   -- Tổng tiền hoàn
  reason TEXT,                                                               -- Lý do trả hàng
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,               -- Người duyệt
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,                -- Người tạo
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bảng: customer_return_items (Chi tiết phiếu trả hàng)
CREATE TABLE IF NOT EXISTS customer_return_items (
  id BIGSERIAL PRIMARY KEY,
  return_id BIGINT NOT NULL REFERENCES customer_returns(id) ON DELETE CASCADE,
  order_item_id BIGINT REFERENCES order_items(id) ON DELETE SET NULL,        -- Item nào được trả
  product_unit_id BIGINT NOT NULL REFERENCES product_units(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),                            -- Số lượng trả
  refund_amount NUMERIC NOT NULL CHECK (refund_amount >= 0),                 -- Tiền hoàn
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- TRIGGER FUNCTION: Tự động sinh mã PTH-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_customer_return_no()
RETURNS TRIGGER AS $$
DECLARE
  date_str VARCHAR(8);
  seq_num INTEGER;
  padding INTEGER;
  new_no VARCHAR(30);
BEGIN
  date_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(
    MAX(CAST(REGEXP_REPLACE(return_no, '^PTH-\d{8}-', '') AS INTEGER)), 
    0
  ) + 1
  INTO seq_num
  FROM customer_returns
  WHERE return_no LIKE 'PTH-' || date_str || '-%';
  
  IF seq_num <= 9999 THEN
    padding := 4;
  ELSIF seq_num <= 99999 THEN
    padding := 5;
  ELSE
    padding := 6;
  END IF;
  
  new_no := 'PTH-' || date_str || '-' || LPAD(seq_num::TEXT, padding, '0');
  NEW.return_no := new_no;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customer_returns_generate_no ON customer_returns;
CREATE TRIGGER trg_customer_returns_generate_no
BEFORE INSERT ON customer_returns
FOR EACH ROW
WHEN (NEW.return_no IS NULL OR NEW.return_no = '')
EXECUTE FUNCTION generate_customer_return_no();

-- TRIGGER FUNCTION: Tự động tạo inventory_movements khi INSERT customer_return_items
CREATE OR REPLACE FUNCTION create_movement_from_customer_return_item()
RETURNS TRIGGER AS $$
DECLARE
  wh_id BIGINT;
  return_status VARCHAR(20);
BEGIN
  SELECT warehouse_id, status INTO wh_id, return_status
  FROM customer_returns
  WHERE id = NEW.return_id;
  
  -- Chỉ tạo movement nếu phiếu đã APPROVED
  IF return_status = 'APPROVED' THEN
    INSERT INTO inventory_movements (
      product_unit_id, warehouse_id, type, quantity, ref_table, ref_id
    ) VALUES (
      NEW.product_unit_id, wh_id, 'RETURN_IN', NEW.quantity, 'customer_return_items', NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customer_return_items_create_movement ON customer_return_items;
CREATE TRIGGER trg_customer_return_items_create_movement
AFTER INSERT ON customer_return_items
FOR EACH ROW
EXECUTE FUNCTION create_movement_from_customer_return_item();

-- INDEX
CREATE INDEX IF NOT EXISTS idx_customer_returns_return_no ON customer_returns(return_no);
CREATE INDEX IF NOT EXISTS idx_customer_returns_order ON customer_returns(order_id);
CREATE INDEX IF NOT EXISTS idx_customer_returns_customer ON customer_returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_returns_warehouse ON customer_returns(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_customer_returns_status ON customer_returns(status);
CREATE INDEX IF NOT EXISTS idx_customer_returns_created_by ON customer_returns(created_by);
CREATE INDEX IF NOT EXISTS idx_customer_return_items_return ON customer_return_items(return_id);
CREATE INDEX IF NOT EXISTS idx_customer_return_items_product ON customer_return_items(product_unit_id);


-- ================================================================================
-- 3. PHIẾU TRẢ HÀNG CHO NCC (Supplier Return - RETURN_OUT)
-- ================================================================================

-- Bảng: supplier_returns (Trả hàng cho nhà cung cấp)
CREATE TABLE IF NOT EXISTS supplier_returns (
  id BIGSERIAL PRIMARY KEY,
  return_no VARCHAR(30) UNIQUE NOT NULL,                                     -- PTHNCC-YYYYMMDD-XXXX
  receipt_id BIGINT REFERENCES goods_receipts(id) ON DELETE SET NULL,        -- Trả từ phiếu nhập nào
  supplier_id UUID REFERENCES profiles(id) ON DELETE SET NULL,               -- Nhà cung cấp
  warehouse_id BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT, -- Xuất từ kho nào
  total_return NUMERIC NOT NULL DEFAULT 0,                                   -- Tổng tiền trả (chưa bao gồm VAT)
  total_vat NUMERIC NOT NULL DEFAULT 0,                                      -- Tổng tiền VAT được hoàn lại
  reason TEXT,                                                               -- Lý do trả hàng
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,                -- Người tạo
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bảng: supplier_return_items (Chi tiết phiếu trả hàng NCC)
CREATE TABLE IF NOT EXISTS supplier_return_items (
  id BIGSERIAL PRIMARY KEY,
  return_id BIGINT NOT NULL REFERENCES supplier_returns(id) ON DELETE CASCADE,
  receipt_item_id BIGINT REFERENCES goods_receipt_items(id) ON DELETE SET NULL,
  product_unit_id BIGINT NOT NULL REFERENCES product_units(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  return_amount NUMERIC NOT NULL CHECK (return_amount >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- TRIGGER FUNCTION: Tự động sinh mã PTHNCC-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_supplier_return_no()
RETURNS TRIGGER AS $$
DECLARE
  date_str VARCHAR(8);
  seq_num INTEGER;
  padding INTEGER;
  new_no VARCHAR(30);
BEGIN
  date_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(
    MAX(CAST(REGEXP_REPLACE(return_no, '^PTHNCC-\d{8}-', '') AS INTEGER)), 
    0
  ) + 1
  INTO seq_num
  FROM supplier_returns
  WHERE return_no LIKE 'PTHNCC-' || date_str || '-%';
  
  IF seq_num <= 9999 THEN
    padding := 4;
  ELSIF seq_num <= 99999 THEN
    padding := 5;
  ELSE
    padding := 6;
  END IF;
  
  new_no := 'PTHNCC-' || date_str || '-' || LPAD(seq_num::TEXT, padding, '0');
  NEW.return_no := new_no;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_supplier_returns_generate_no ON supplier_returns;
CREATE TRIGGER trg_supplier_returns_generate_no
BEFORE INSERT ON supplier_returns
FOR EACH ROW
WHEN (NEW.return_no IS NULL OR NEW.return_no = '')
EXECUTE FUNCTION generate_supplier_return_no();

-- TRIGGER FUNCTION: Tự động tạo inventory_movements khi INSERT supplier_return_items
CREATE OR REPLACE FUNCTION create_movement_from_supplier_return_item()
RETURNS TRIGGER AS $$
DECLARE
  wh_id BIGINT;
  return_status VARCHAR(20);
BEGIN
  SELECT warehouse_id, status INTO wh_id, return_status
  FROM supplier_returns
  WHERE id = NEW.return_id;
  
  IF return_status = 'APPROVED' THEN
    INSERT INTO inventory_movements (
      product_unit_id, warehouse_id, type, quantity, ref_table, ref_id
    ) VALUES (
      NEW.product_unit_id, wh_id, 'RETURN_OUT', NEW.quantity, 'supplier_return_items', NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_supplier_return_items_create_movement ON supplier_return_items;
CREATE TRIGGER trg_supplier_return_items_create_movement
AFTER INSERT ON supplier_return_items
FOR EACH ROW
EXECUTE FUNCTION create_movement_from_supplier_return_item();

-- INDEX
CREATE INDEX IF NOT EXISTS idx_supplier_returns_return_no ON supplier_returns(return_no);
CREATE INDEX IF NOT EXISTS idx_supplier_returns_receipt ON supplier_returns(receipt_id);
CREATE INDEX IF NOT EXISTS idx_supplier_returns_supplier ON supplier_returns(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_returns_warehouse ON supplier_returns(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_supplier_returns_status ON supplier_returns(status);
CREATE INDEX IF NOT EXISTS idx_supplier_returns_created_by ON supplier_returns(created_by);
CREATE INDEX IF NOT EXISTS idx_supplier_return_items_return ON supplier_return_items(return_id);
CREATE INDEX IF NOT EXISTS idx_supplier_return_items_product ON supplier_return_items(product_unit_id);


-- ================================================================================
-- 4. CẬP NHẬT TRIGGER
-- ================================================================================
-- Trigger function để cập nhật stock khi có inventory movement

CREATE OR REPLACE FUNCTION apply_product_unit_stock_on_movement_ins()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Các loại GIẢM tồn: xuất bán, trả hàng cho NCC
  IF NEW.type IN ('SALE','RETURN_OUT') THEN
    UPDATE product_units SET stock = stock - NEW.quantity WHERE id = NEW.product_unit_id;
  -- Các loại TĂNG tồn: nhập hàng, khách trả hàng
  ELSE
    UPDATE product_units SET stock = stock + NEW.quantity WHERE id = NEW.product_unit_id;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION apply_product_unit_stock_on_movement_upd()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Bước 1: Hoàn nguyên stock theo OLD record
  IF OLD.type IN ('SALE','RETURN_OUT') THEN
    UPDATE product_units SET stock = stock + OLD.quantity WHERE id = OLD.product_unit_id;
  ELSE
    UPDATE product_units SET stock = stock - OLD.quantity WHERE id = OLD.product_unit_id;
  END IF;
  
  -- Bước 2: Áp dụng stock theo NEW record
  IF NEW.type IN ('SALE','RETURN_OUT') THEN
    UPDATE product_units SET stock = stock - NEW.quantity WHERE id = NEW.product_unit_id;
  ELSE
    UPDATE product_units SET stock = stock + NEW.quantity WHERE id = NEW.product_unit_id;
  END IF;
  
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION apply_product_unit_stock_on_movement_del()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Hoàn nguyên stock (đảo ngược logic)
  IF OLD.type IN ('SALE','RETURN_OUT') THEN
    UPDATE product_units SET stock = stock + OLD.quantity WHERE id = OLD.product_unit_id;
  ELSE
    UPDATE product_units SET stock = stock - OLD.quantity WHERE id = OLD.product_unit_id;
  END IF;
  RETURN OLD;
END $$;


-- ================================================================================
-- 5. TRIGGERS: Tự động tạo inventory_movements khi approve documents
-- ================================================================================
-- Khi status thay đổi từ DRAFT/PENDING sang CONFIRMED/APPROVED,
-- tự động tạo inventory_movements cho tất cả items đã có sẵn

-- ================================================================================
-- 5.1 TRIGGER: Tự động tạo movements khi goods_receipt được CONFIRM
-- ================================================================================
CREATE OR REPLACE FUNCTION create_movements_on_goods_receipt_confirm()
RETURNS TRIGGER AS $$
BEGIN
  -- Chỉ chạy khi status thay đổi SANG CONFIRMED
  IF OLD.status != 'CONFIRMED' AND NEW.status = 'CONFIRMED' THEN
    -- Tạo inventory_movements cho tất cả items của phiếu này
    INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id)
    SELECT 
      gri.product_unit_id,
      NEW.warehouse_id,
      'PURCHASE',
      gri.quantity,
      'goods_receipt_items',
      gri.id
    FROM goods_receipt_items gri
    WHERE gri.receipt_id = NEW.id
    -- Chỉ tạo nếu chưa có movement cho item này
    AND NOT EXISTS (
      SELECT 1 FROM inventory_movements im
      WHERE im.ref_table = 'goods_receipt_items' AND im.ref_id = gri.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_goods_receipt_confirm_create_movements ON goods_receipts;
CREATE TRIGGER trg_goods_receipt_confirm_create_movements
AFTER UPDATE ON goods_receipts
FOR EACH ROW
EXECUTE FUNCTION create_movements_on_goods_receipt_confirm();


-- ================================================================================
-- 5.2 TRIGGER: Tự động tạo movements khi customer_return được APPROVE
-- ================================================================================
CREATE OR REPLACE FUNCTION create_movements_on_customer_return_approve()
RETURNS TRIGGER AS $$
BEGIN
  -- Chỉ chạy khi status thay đổi SANG APPROVED
  IF OLD.status != 'APPROVED' AND NEW.status = 'APPROVED' THEN
    -- Tạo inventory_movements cho tất cả items của phiếu này
    INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id)
    SELECT 
      cri.product_unit_id,
      NEW.warehouse_id,
      'RETURN_IN',
      cri.quantity,
      'customer_return_items',
      cri.id
    FROM customer_return_items cri
    WHERE cri.return_id = NEW.id
    -- Chỉ tạo nếu chưa có movement cho item này
    AND NOT EXISTS (
      SELECT 1 FROM inventory_movements im
      WHERE im.ref_table = 'customer_return_items' AND im.ref_id = cri.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customer_return_approve_create_movements ON customer_returns;
CREATE TRIGGER trg_customer_return_approve_create_movements
AFTER UPDATE ON customer_returns
FOR EACH ROW
EXECUTE FUNCTION create_movements_on_customer_return_approve();


-- ================================================================================
-- 5.3 TRIGGER: Tự động tạo movements khi supplier_return được APPROVE
-- ================================================================================
CREATE OR REPLACE FUNCTION create_movements_on_supplier_return_approve()
RETURNS TRIGGER AS $$
BEGIN
  -- Chỉ chạy khi status thay đổi SANG APPROVED
  IF OLD.status != 'APPROVED' AND NEW.status = 'APPROVED' THEN
    -- Tạo inventory_movements cho tất cả items của phiếu này
    INSERT INTO inventory_movements (product_unit_id, warehouse_id, type, quantity, ref_table, ref_id)
    SELECT 
      sri.product_unit_id,
      NEW.warehouse_id,
      'RETURN_OUT',
      sri.quantity,
      'supplier_return_items',
      sri.id
    FROM supplier_return_items sri
    WHERE sri.return_id = NEW.id
    -- Chỉ tạo nếu chưa có movement cho item này
    AND NOT EXISTS (
      SELECT 1 FROM inventory_movements im
      WHERE im.ref_table = 'supplier_return_items' AND im.ref_id = sri.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_supplier_return_approve_create_movements ON supplier_returns;
CREATE TRIGGER trg_supplier_return_approve_create_movements
AFTER UPDATE ON supplier_returns
FOR EACH ROW
EXECUTE FUNCTION create_movements_on_supplier_return_approve();
