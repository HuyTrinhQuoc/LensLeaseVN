-- Bật extension để hỗ trợ tự động sinh UUID nếu server chưa bật
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Xóa dữ liệu cũ (Tùy chọn, cẩn thận nếu đang có dữ liệu thật)
-- Xóa theo thứ tự từ bảng con đến bảng cha để không vi phạm khóa ngoại
DELETE FROM public.reviews;
DELETE FROM public.bookings;
DELETE FROM public.lens_images;
DELETE FROM public.lens_listings;
DELETE FROM public.users;

-- ==========================================
-- 1. INSERT USERS (NGƯỜI DÙNG)
-- ==========================================
INSERT INTO public.users (id, full_name, email, password_hash, phone, address, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Nguyễn Văn Chủ', 'chuthue@lenslease.vn', 'hashed_password_123', '0901234567', 'Quận 1, TP.HCM', 'lender'),
('22222222-2222-2222-2222-222222222222', 'Trần Thị Cho Thuê', 'tranthi@lenslease.vn', 'hashed_password_123', '0912345678', 'Quận Cầu Giấy, Hà Nội', 'lender'),
('33333333-3333-3333-3333-333333333333', 'Lê Khách Hàng', 'khachhang1@gmail.com', 'hashed_password_123', '0923456789', 'Quận 3, TP.HCM', 'renter'),
('44444444-4444-4444-4444-444444444444', 'Phạm Thợ Ảnh', 'thoanhpro@gmail.com', 'hashed_password_123', '0934567890', 'Quận Hải Châu, Đà Nẵng', 'renter'),
('55555555-5555-5555-5555-555555555555', 'Hoàng Dựng Phim', 'hoangvideo@gmail.com', 'hashed_password_123', '0945678901', 'Quận Gò Vấp, TP.HCM', 'renter');

-- ==========================================
-- 2. INSERT LENS LISTINGS (SẢN PHẨM)
-- ==========================================
INSERT INTO public.lens_listings (id, owner_id, title, description, brand, type, price_per_day, available) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Sony Alpha A7IV Body', 'Máy ảnh mirrorless full-frame thế hệ mới, lấy nét siêu nhanh, quay phim 4K.', 'Sony', 'Camera', 450000, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Ống kính Sony FE 24-70mm f/2.8 GM II', 'Ống kính zoom tiêu chuẩn G Master thế hệ 2 cực nét, siêu nhẹ.', 'Sony', 'Lens', 350000, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Canon EOS R5 Body', 'Máy ảnh chuyên nghiệp 45MP, quay video 8K RAW.', 'Canon', 'Camera', 800000, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Ống kính Canon RF 70-200mm f/2.8L IS USM', 'Ống kính tele đa dụng chuyên chụp chân dung, sự kiện.', 'Canon', 'Lens', 400000, false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Fujifilm X-T5 Kèm Kit 18-55mm', 'Máy ảnh phong cách retro, cảm biến 40MP màu sắc tuyệt đẹp.', 'Fujifilm', 'Camera', 350000, true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'Ống kính Sigma 35mm f/1.4 DG DN Art', 'Ống kính chụp chân dung, thiếu sáng cực tốt cho ngàm E-Mount.', 'Sigma', 'Lens', 200000, true);

-- ==========================================
-- 3. INSERT LENS IMAGES (HÌNH ẢNH SẢN PHẨM)
-- ==========================================
-- Mỗi sản phẩm có 2 hình ảnh
INSERT INTO public.lens_images (lens_id, image_url) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://example.com/images/sony-a7iv-1.jpg'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://example.com/images/sony-a7iv-2.jpg'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://example.com/images/sony-2470-1.jpg'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://example.com/images/sony-2470-2.jpg'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://example.com/images/canon-r5-1.jpg'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://example.com/images/canon-r5-2.jpg'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://example.com/images/canon-70200-1.jpg'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://example.com/images/canon-70200-2.jpg'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'https://example.com/images/fuji-xt5-1.jpg'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'https://example.com/images/fuji-xt5-2.jpg'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'https://example.com/images/sigma-35mm-1.jpg');

-- ==========================================
-- 4. INSERT BOOKINGS (ĐƠN ĐẶT THUÊ)
-- ==========================================
INSERT INTO public.bookings (user_id, lens_id, start_date, end_date, status, total_price) VALUES
-- Khách hàng 3 thuê sản phẩm A (Đã hoàn thành)
('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-03-01', '2026-03-03', 'completed', 1350000),
-- Khách hàng 3 thuê sản phẩm B (Đang xử lý)
('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-04-25', '2026-04-26', 'pending', 350000),
-- Khách hàng 4 thuê sản phẩm C (Đang trong thời gian thuê)
('44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-04-20', '2026-04-25', 'active', 4000000),
-- Khách hàng 4 thuê sản phẩm D (Đã hủy)
('44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2026-02-10', '2026-02-12', 'cancelled', 800000),
-- Khách hàng 5 thuê sản phẩm E (Đã hoàn thành)
('55555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-03-15', '2026-03-17', 'completed', 700000),
-- Khách hàng 5 thuê sản phẩm F (Đang giao hàng / chuẩn bị thuê)
('55555555-5555-5555-5555-555555555555', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2026-05-01', '2026-05-05', 'approved', 800000);

-- ==========================================
-- 5. INSERT REVIEWS (ĐÁNH GIÁ SẢN PHẨM)
-- ==========================================
INSERT INTO public.reviews (user_id, lens_id, rating, comment) VALUES
-- Khách hàng 3 đánh giá sản phẩm A
('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 'Máy bay rất êm, lấy nét vào mắt cực nhanh, chủ shop nhiệt tình!'),
-- Khách hàng 5 đánh giá sản phẩm E
('55555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 4, 'Máy ngoại hình đẹp, chụp lên màu vintage cực xinh. Tuy nhiên pin hơi chai một xíu.'),
-- Khách hàng 4 đánh giá (trước đó từng thuê xong 1 đơn C)
('44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 5, 'Chất lượng 8K RAW đúng là không có gì để chê, phù hợp quay TVC.'),
-- Khách hàng 3 đánh giá sản phẩm B (thuê kèm đợt trước)
('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, 'Lens nét căng ngay tại f2.8, không bị viền tím nhiều.');
