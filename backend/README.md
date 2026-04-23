# 📷 LensLeaseVN - Backend API Server

Chào mừng bạn đến với kho lưu trữ mã nguồn Backend của dự án **LensLeaseVN** (Nền tảng cho thuê Máy ảnh & Ống kính). 
Dự án được xây dựng với kiến trúc hướng dịch vụ (Service-Oriented Architecture) bằng NestJS, đảm bảo tính bảo mật, dễ dàng mở rộng và chịu tải cao.

---

## 🛠 Tech Stack (Công nghệ sử dụng)
- **Framework:** [NestJS](https://nestjs.com/) (Node.js framework mạnh mẽ nhất hiện nay).
- **ORM:** [Prisma v5](https://www.prisma.io/) (Type-safe Database Client).
- **Database:** PostgreSQL (Lưu trữ đám mây tại [Supabase](https://supabase.com/)).
- **Connection Pooling:** Sử dụng IPv4 Session Pooler (pgBouncer) của Supabase để tối ưu hóa hiệu suất mạng tại Việt Nam.
- **Documentation:** Swagger (OpenAPI 3.0).

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án (Getting Started)

Dành cho các thành viên trong nhóm mới clone code về, vui lòng làm theo đúng thứ tự các bước sau:

### 1. Yêu cầu hệ thống (Prerequisites)
Đảm bảo máy tính của bạn đã cài đặt sẵn:
- Node.js (phiên bản 18.x hoặc 20.x trở lên).
- NPM (Đi kèm với Node.js).

### 2. Cài đặt thư viện (Install Dependencies)
Mở Terminal, trỏ vào thư mục `backend` và chạy lệnh sau để tải các thư viện cần thiết:
```bash
npm install
```

### 3. Cấu hình Biến Môi Trường (Environment Variables)
Tuyệt đối KHÔNG ĐƯỢC commit file `.env` lên GitHub để tránh rò rỉ mật khẩu Database!
1. Tìm file `.env.example` trong thư mục `backend`.
2. Copy toàn bộ nội dung hoặc Đổi tên file đó thành `.env`.
3. Nhập mật khẩu thật của Database vào thay thế cho chuỗi `LensLeaseVN%402026` (nếu có thay đổi mật khẩu) tại 2 dòng `DATABASE_URL` và `DIRECT_URL`.

*(Lưu ý: Mật khẩu bắt buộc phải được mã hóa URL, ví dụ ký tự `@` phải viết thành `%40`).*

### 4. Khởi tạo Prisma Client
Vì chúng ta sử dụng Prisma, bạn cần sinh ra (generate) các Type Definition để VS Code gợi ý code thông minh bằng lệnh:
```bash
npx prisma generate
```

### 5. Khởi chạy Server
Dùng lệnh sau để khởi chạy Server ở chế độ Phát triển (Tự động tải lại khi sửa code):
```bash
npm run start:dev
```
Nếu Terminal báo `[NestApplication] Nest application successfully started`, chúc mừng bạn đã cài đặt thành công! Server đang chạy tại: `http://localhost:3000`.

---

## 📚 Tài liệu API & Kiểm thử (Testing)

### 1. Swagger API Documentation (Khuyên dùng)
Backend đã được nhúng sẵn tài liệu API tự động. Khi Server đang chạy, bạn chỉ cần dùng trình duyệt web truy cập vào:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

Tại đây, bạn có thể xem giải thích chi tiết cấu trúc JSON trả về của từng API và bấm nút **Try it out** để test trực tiếp trên web.

### 2. Postman Collection
Dành cho team Tester, tôi đã thiết lập sẵn một bộ kiểm thử chuyên nghiệp.
- Mở Postman.
- Import file: `LensLeaseVN_Postman_Collection.json` (Nằm ở thư mục gốc của Backend).
- Bộ Collection này đã được lập trình sẵn các mã Javascript để tự động kiểm thử (Automated Tests) như: Bắt buộc Join bảng, Status 200, Schema validation...

---

## 📁 Cấu trúc thư mục cốt lõi
```text
backend/
├── prisma/
│   └── schema.prisma         # Toàn bộ thiết kế các Bảng Database (Tables)
├── src/
│   ├── modules/
│   │   ├── users/            # Quản lý người dùng, phân quyền
│   │   └── cameras/          # Quản lý Máy ảnh, Ống kính
│   ├── database/seeders/     # Chứa file SQL để bơm dữ liệu mẫu vào DB
│   ├── prisma.service.ts     # Trái tim kết nối Database
│   └── main.ts               # File chạy chính, chứa cấu hình CORS và Swagger
```

Chúc cả nhóm đạt điểm tuyệt đối cho Đồ án này! 🎉
