import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Pages
import HomePage from '../pages/Home/HomePage';
import CartPage from '../pages/Cart/CartPage';
import LenderOrdersPage from '../pages/Lender/Orders';

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
