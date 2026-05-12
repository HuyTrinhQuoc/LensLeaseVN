import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Pages
import HomePage from '../pages/Home/HomePage';
import CartPage from '../pages/Cart/CartPage';
import LenderOrdersPage from '../pages/Lender/Orders';
import ProductsPage from '../pages/Products/ProductsPage';
import ProductDetailPage from '../pages/ProductDetail/ProductDetailPage';

import WalletPage from '../pages/Wallet/WalletPage';

import LoginSuccess from '../pages/Login/GoogleSuccess';
import Auth from '../pages/Login/Auth';
import Register from '../pages/Login/Register';

//chưa xử lí backend
import BookingPage from '../pages/BookingSchedule/Booking';
import VerificationPage from '../pages/Checkout/Verification';
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import BookingSuccessPage from '../pages/Checkout/SuccessPage';
import BookingHistoryPage from '../pages/History/HistoryPage';
import ChatPage from '../pages/Chat/ChatPage';

/**
 * AppRoutes — Cấu hình định tuyến chính của ứng dụng phân chia theo Role.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ── USER ROUTES (Renter / Guest) ── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/Verification" element={<VerificationPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
         <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/wallet" element={<WalletPage />} />
         <Route path="/booking" element={<BookingPage />} />
          <Route path="/success" element={<BookingSuccessPage />} />
          <Route path="/history" element={<BookingHistoryPage />} />
          <Route path="/chat" element={<ChatPage />} />
      </Route>

      {/* ── LENDER ROUTES (Chủ thiết bị) ── */}
      <Route path="/lender" element={<DashboardLayout />}>
        <Route path="orders" element={<LenderOrdersPage />} />
        {/* Thêm các route khác của Lender ở đây */}
      </Route>
      
      {/* ── ADMIN ROUTES ── */}
      {/* Cấu trúc tương tự DashboardLayout nhưng dành cho Admin */}

      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login-success" element={<LoginSuccess />} />
    </Routes>
  );
}
