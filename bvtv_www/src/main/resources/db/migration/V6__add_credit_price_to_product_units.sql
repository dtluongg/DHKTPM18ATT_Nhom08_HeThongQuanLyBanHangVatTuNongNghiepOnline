-- Thêm cột credit_price vào bảng product_units
ALTER TABLE product_units 
ADD COLUMN IF NOT EXISTS credit_price DECIMAL(19,2) NULL;

-- Thêm comment cho cột credit_price
COMMENT ON COLUMN product_units.credit_price IS 'Giá bán nợ cho khách mua trực tiếp';
