import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Pages
import HomePage from '../pages/Home/HomePage';
import CartPage from '../pages/Cart/CartPage';
import LenderOrdersPage from '../pages/Lender/Orders';
import ProductsPage from '../pages/Products/ProductsPage';
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import WalletPage from '../pages/Wallet/WalletPage';

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
        <Route path="/checkout" element={<CheckoutPage />} />
         <Route path="/products" element={<ProductsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
      </Route>

      {/* ── LENDER ROUTES (Chủ thiết bị) ── */}
      <Route path="/lender" element={<DashboardLayout />}>
        <Route path="orders" element={<LenderOrdersPage />} />
        {/* Thêm các route khác của Lender ở đây */}
      </Route>
      
      {/* ── ADMIN ROUTES ── */}
      {/* Cấu trúc tương tự DashboardLayout nhưng dành cho Admin */}

      
    </Routes>
  );
}
