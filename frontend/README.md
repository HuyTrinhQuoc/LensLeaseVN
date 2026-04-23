# 🎨 LensLeaseVN - Frontend Web Application

Chào mừng bạn đến với mã nguồn Giao diện (Frontend) của dự án **LensLeaseVN** (Nền tảng cho thuê Máy ảnh & Ống kính).
Giao diện được xây dựng tối ưu hóa trải nghiệm người dùng (UX) và hiệu năng cực cao bằng Vite và React.

---

## 🛠 Tech Stack (Công nghệ sử dụng)
- **Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/).
- **Bundler:** [Vite](https://vitejs.dev/) (Build tool siêu tốc, thay thế cho Create React App).
- **Styling:** CSS thuần (Vanilla CSS) với cấu trúc thiết kế hiện đại, dễ dàng custom.
- **State Management:** React Context API (CartContext, AuthContext).
- **Router:** React Router DOM (Điều hướng trang mượt mà không load lại trang).

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án (Getting Started)

Dành cho các thành viên trong nhóm mới clone code về, vui lòng làm theo đúng thứ tự sau:

### 1. Yêu cầu hệ thống (Prerequisites)
Đảm bảo máy tính của bạn đã cài đặt sẵn Node.js và NPM.

### 2. Cài đặt thư viện (Install Dependencies)
Mở Terminal, trỏ vào thư mục `frontend` và chạy lệnh sau để tải các gói thư viện:
```bash
npm install
```

### 3. Cấu hình Biến Môi Trường (Environment Variables)
1. Trong thư mục `frontend`, hãy tạo một file mới và đặt tên là `.env`.
2. Mở file đó ra và dán 3 dòng cấu hình sau vào (Bạn có thể xin 3 dòng này từ Trưởng nhóm):
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=https://uhwtgufhkuwdeaxaxnop.supabase.co
VITE_SUPABASE_ANON_KEY=điền_key_anon_của_bạn_vào_đây
```
*(Lưu ý: File `.env` của Frontend là công khai, mục đích để kết nối với Backend ở cổng 3000 và tính năng đăng nhập của Supabase).*

### 4. Khởi chạy Website
Dùng lệnh sau để khởi chạy máy chủ phát triển Vite:
```bash
npm run dev
```
Giao diện trang web của bạn sẽ được mở tại: 👉 **http://localhost:5173**

---

## 🔗 Liên kết với Backend (API Connection)
- Để hiển thị được dữ liệu sản phẩm, bạn **bắt buộc phải bật Server Backend** ở cổng `3000` (xem hướng dẫn ở file README bên thư mục `backend`).
- Mọi API Call từ Frontend gửi xuống Backend đều đã được mở khóa CORS an toàn.

---

## 📁 Cấu trúc thư mục cốt lõi
```text
frontend/
├── src/
│   ├── components/         # Các mảnh ghép giao diện dùng chung (Header, Footer, Navbar...)
│   ├── pages/              # Các trang chính của Website (Home, Cart, Checkout, Lenses...)
│   ├── context/            # Nơi lưu trữ trạng thái toàn cục (Giỏ hàng, Đăng nhập...)
│   ├── routes/             # Cấu hình các đường dẫn (URL) của Website
│   ├── styles/             # Toàn bộ CSS cho dự án
│   └── main.tsx            # Điểm bắt đầu (Entry point) của ứng dụng React
```

Chúc team Frontend thiết kế được một giao diện thật đẹp và mượt mà nhé! 🎨
