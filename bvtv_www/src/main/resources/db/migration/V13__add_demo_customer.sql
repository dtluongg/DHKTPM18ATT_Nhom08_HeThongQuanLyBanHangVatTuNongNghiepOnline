-- Add demo customer account
INSERT INTO profiles (
  email, password_hash, name, sort_name, phone, address, area_id, role, is_active
)
SELECT
  'khachhang@sauhiep.vn',
  '$2a$10$X5wFBtLrL0aWnNqBqOqrXee5o8lUqbGxKDfxH2YrTLMG/yLLEYAi2', -- BCrypt hash of "123"
  'Nguyễn Văn Khách',
  'Anh Khách',
  '0999999999',
  'Ấp Bổn Thanh, xã Ngũ Lạc, phường Duyên Hải, tỉnh Vĩnh Long',
  (SELECT id FROM areas WHERE name='Ấp Bổn Thanh' LIMIT 1),
  'CUSTOMER',
  true
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'khachhang@sauhiep.vn');
