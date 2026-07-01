import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProfileDashboardLayout from '../components/layout/ProfileDashboardLayout';

// Pages — Public / Renter
import HomePage from '../pages/Home/HomePage';
import CartPage from '../pages/Cart/CartPage';
import ProductsPage from '../pages/Products/ProductsPage';
import ProductDetailPage from '../pages/ProductDetail/ProductDetailPage';
import WalletPage from '../pages/Wallet/WalletPage';
import WalletTopupResultPage from '../pages/Wallet/WalletTopupResultPage';
import AboutPage from '../pages/About/AboutPage';
import NewsPage from '../pages/News/NewsPage';
import ContactPage from '../pages/Contact/ContactPage';

import LoginSuccess from '../pages/Login/GoogleSuccess';
import Auth from '../pages/Login/Auth';
import Register from '../pages/Login/Register';

import BookingPage from '../pages/BookingSchedule/Booking';
import VerificationPage from '../pages/Checkout/Verification';
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import BookingSuccessPage from '../pages/Checkout/SuccessPage';
import BookingPaymentResultPage from '../pages/Checkout/BookingPaymentResultPage';
import BookingHistoryPage from '../pages/History/HistoryPage';
import BookingDetailPage from '../pages/BookingDetail/BookingDetailPage';
import ChatPage from '../pages/Chat/ChatPage';
import NewListingPage from '../pages/Owner/NewListingPage';
import ProfileHubLayout from '../components/profile/ProfileHubLayout';
import ProfileOverviewPage from '../pages/Profile/ProfileOverviewPage';
import ProfileAccountPage from '../pages/Profile/ProfileAccountPage';
import BecomeOwnerPage from '../pages/Profile/BecomeOwnerPage';

// Pages — Dashboard (Profile / Lender)
import DashboardOrdersPage from '../pages/Dashboard/DashboardOrdersPage';
import DashboardMyListingsPage from '../pages/Dashboard/DashboardMyListingsPage';
import DashboardStatsPage from '../pages/Dashboard/DashboardStatsPage';
import DashboardPromotionsPage from '../pages/Dashboard/DashboardPromotionsPage';
import HandoverForm from '../components/layout/HandoverForm';
import VerifyEmail from '../components/layout/VerifyEmail';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';
import AdminUserManagement from '../pages/AdminUserManagement/AdminUserManagement';
import AdminListingsManagement from '../pages/AdminListingsManagement/AdminListingsManagement';
import AdminFinance from '../pages/AdminFinanceDashboard/AdminFinance';
import AdminOwnerApplicationsPage from '../pages/AdminOwnerApplications/AdminOwnerApplicationsPage';
import AdminPromotionsPage from '../pages/AdminPromotions/AdminPromotionsPage';
import DeviceSchedulePage from '../pages/DeviceSchedulePage/ScheduleDashboard';
import AdminBookingManagement from '../pages/AdminBookingManagement/AdminBookingManagement';
import { NotificationDropdown } from '../components/AdminNotification/NotificationDropdown';
import ProductComparePage from '../pages/Products/ProductComparePage';

/**
 * AppRoutes — Cấu hình định tuyến chính của ứng dụng.
 *
 * Cấu trúc:
 *  /              — MainLayout (Header/Footer) cho trang Renter / Guest
 *  /dashboard/*   — ProfileDashboardLayout (Sidebar + Topbar) cho User Profile
 *  /login, etc.   — Standalone auth pages
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ══════════════════════════════════════════════
          USER ROUTES (Renter / Guest) — MainLayout
          ══════════════════════════════════════════════ */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/Verification" element={<VerificationPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/compare" element={<ProductComparePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/wallet/topup/result" element={<WalletTopupResultPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* <Route path="/handover" element={<HandoverForm />} /> */}
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/success" element={<BookingSuccessPage />} />
        <Route path="/bookings/payment-result" element={<BookingPaymentResultPage />} />
        <Route path="/history" element={<BookingHistoryPage />} />
        <Route path="/bookings/:id" element={<BookingDetailPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfileHubLayout />}>
          <Route index element={<ProfileOverviewPage />} />
          <Route path="account" element={<ProfileAccountPage />} />
          <Route path="become-owner" element={<BecomeOwnerPage />} />
        </Route>
        <Route path="/become-owner" element={<Navigate to="/profile/become-owner" replace />} />
      </Route>

      {/* ══════════════════════════════════════════════
          DASHBOARD — ProfileDashboardLayout
          Sidebar trái (Renter + Lender) + Topbar + Content
          ══════════════════════════════════════════════ */}
      <Route path="/dashboard" element={<ProfileDashboardLayout />}>
        {/* Mặc định vào "Đơn cho thuê" */}
        <Route index element={<Navigate to="orders" replace />} />

        {/* Lender pages */}
        <Route path="orders" element={<DashboardOrdersPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="wallet/topup/result" element={<WalletTopupResultPage />} />
        <Route path="my-listings" element={<DashboardMyListingsPage />} />
        <Route path="stats" element={<DashboardStatsPage />} />
        <Route path="promotions" element={<DashboardPromotionsPage />} />
        <Route path="new-listing" element={<NewListingPage />} />
          <Route path="device-schedule" element={<DeviceSchedulePage />} />  

        {/* Reuse existing NewListingPage nếu có */}

      </Route>


<Route path="/admin" element={<AdminLayout />}>

  <Route index element={<AdminDashboard />} /> 
  <Route path="dashboard" element={<AdminDashboard />} />

  <Route path="users" element={<AdminUserManagement />} /> 
  
  <Route path="listings" element={<AdminListingsManagement />} /> 

  <Route path="promotions" element={<AdminPromotionsPage />} /> 

  <Route path="owner-applications" element={<AdminOwnerApplicationsPage />} />
  
  <Route path="finance" element={<AdminFinance />} />  

  <Route path="bookings" element={<AdminBookingManagement />} />  

    <Route path="notification" element={<NotificationDropdown />} />  
</Route>

      {/* ══════════════════════════════════════════════
          LEGACY LENDER ROUTES (redirect to new dashboard)
          ══════════════════════════════════════════════ */}
      <Route path="/lender" element={<Navigate to="/dashboard" replace />} />
      <Route path="/lender/*" element={<Navigate to="/dashboard" replace />} />

      {/* ══════════════════════════════════════════════
          AUTH PAGES (Standalone — no layout)
          ══════════════════════════════════════════════ */}
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login/success" element={<LoginSuccess />} />
      <Route path="/verify" element={<VerifyEmail />} />

   <Route path="schedule" element={<DeviceSchedulePage />} />  
    </Routes>
  );
}
