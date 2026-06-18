-- Lưu số CCCD (text từ FPT OCR) — unique khi có giá trị, dùng chống trùng tài khoản
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cccd_number" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "users_cccd_number_key" ON "users"("cccd_number");
