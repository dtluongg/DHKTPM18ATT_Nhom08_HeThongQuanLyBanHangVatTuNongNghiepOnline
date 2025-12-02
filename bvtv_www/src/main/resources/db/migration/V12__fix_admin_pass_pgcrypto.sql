-- Fix password for admin and staff using pgcrypto to ensure valid bcrypt hash
UPDATE profiles 
SET password_hash = crypt('123', gen_salt('bf')) 
WHERE email = 'admin@sauhiep.vn';

UPDATE profiles 
SET password_hash = crypt('123', gen_salt('bf')) 
WHERE email = 'nhanvien@sauhiep.vn';
