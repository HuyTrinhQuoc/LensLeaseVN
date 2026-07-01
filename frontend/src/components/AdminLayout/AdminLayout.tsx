import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom'; // 🆕 Thêm useNavigate
import { NotificationDropdown } from '../AdminNotification/NotificationDropdown';


const AdminLayout: React.FC = () => {
  const navigate = useNavigate(); // 🆕 Khởi tạo navigate

  // 🆕 Hàm xử lý đăng xuất
  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài

    // Xóa token khỏi localStorage
    localStorage.removeItem('token');

    // Chuyển hướng về trang login
    navigate('/login');
  };

  // Menu trên máy tính
  const getDesktopNavStyle = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-5 py-3.5 rounded-xl text-base transition-all duration-300 border-l-4 ${isActive
      ? 'bg-primary/10 text-primary font-bold border-primary shadow-sm'
      : 'border-transparent text-on-surface-variant font-medium hover:bg-surface-container-highest hover:text-on-surface hover:translate-x-1'
    }`;

  // Menu dưới đáy (Mobile)
  const getMobileNavStyle = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center rounded-xl w-16 py-2 transition-all duration-300 ease-in-out ${isActive
      ? 'text-primary font-bold'
      : 'text-on-surface-variant opacity-70 hover:bg-surface-container-highest hover:opacity-100 font-medium'
    }`;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col md:flex-row pb-20 md:pb-0 antialiased">

      {/* TopAppBar (Mobile & Web Context) */}
      <header className="w-full top-0 sticky z-40 bg-surface-bright dark:bg-surface-dim md:hidden shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            <span className="text-xl font-bold text-primary tracking-tighter">LensLease VN</span>
          </div>
          {/* 🆕 Gắn thêm onClick đăng xuất cho avatar Mobile */}
          <div
            onClick={handleLogout}
            className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold shadow-md cursor-pointer"
            title="Đăng xuất"
          >
            AP
          </div>
        </div>
      </header>

      {/* Side Navigation (Web) */}
      <aside className="hidden md:flex flex-col w-[280px] fixed h-screen bg-surface-container-lowest  shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="px-6 py-6 flex items-center gap-3 ">
          <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          <span className="text-2xl font-bold text-primary tracking-tighter">LensLease VN</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
          
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-5 opacity-70">Menu Quản Trị</p>

          <NavLink to="/admin/dashboard" className={getDesktopNavStyle}>
            <span className="material-symbols-outlined text-[24px]">dashboard</span>
            Dashboard
          </NavLink>

          <NavLink to="/admin/users" className={getDesktopNavStyle}>
            <span className="material-symbols-outlined text-[24px]">group</span>
            Người dùng
          </NavLink>

          <NavLink to="/admin/owner-applications" className={getDesktopNavStyle}>
            <span className="material-symbols-outlined text-[24px]">storefront</span>
            Duyệt chủ cho thuê
          </NavLink>

          <NavLink to="/admin/listings" className={getDesktopNavStyle}>
            <span className="material-symbols-outlined text-[24px]">camera</span>
            Tin đăng & Thiết bị
          </NavLink>

          <NavLink to="/admin/promotions" className={getDesktopNavStyle}>
            <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
            Voucher
          </NavLink>
          
          <NavLink to="/admin/finance" className={getDesktopNavStyle}>
            <span className="material-symbols-outlined text-[24px]">payments</span>
            Tài chính
          </NavLink>


        </nav>
        <NavLink to="/admin/categories" className={getDesktopNavStyle}>
          <span className="material-symbols-outlined text-[24px]">
            category
          </span>
          Danh mục
        </NavLink>

        <NavLink to="/admin/bookings" className={getDesktopNavStyle}>
          <span className="material-symbols-outlined text-[24px]">
            assignment
          </span>
          Đơn thuê
        </NavLink>

        <NavLink to="/admin/system" className={getDesktopNavStyle}>
          <span className="material-symbols-outlined text-[24px]">
            settings
          </span>
          Hệ thống
        </NavLink>
        <div className="p-4 bg-surface-container-lowest">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-highest cursor-pointer transition-colors group">
            <div className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center text-base font-bold shadow-sm">AP</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-base font-semibold text-on-surface truncate">Admin Profile</p>
              <p className="text-sm font-medium text-on-surface-variant truncate opacity-80">admin@lenslease.vn</p>
            </div>
            {/* 🆕 Gắn xử lý Logout vào icon */}
            <span
              onClick={handleLogout}
              title="Đăng xuất"
              className="material-symbols-outlined text-on-surface-variant text-[24px] hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
            >
              logout
            </span>
          </div>
        </div>
      </aside>
        <div className="fixed top-4 right-8 z-50">
  <NotificationDropdown />
</div>
      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-[280px] p-6 md:p-8 md:p-margin-page bg-background mt-6">
        <Outlet />
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] pb-safe">
        <div className="flex justify-around items-center px-2 py-2">
          <NavLink to="/admin/dashboard" className={getMobileNavStyle}>
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="mt-1 text-xs text-center w-full">Dashboard</span>
          </NavLink>
          
          <NavLink to="/admin/users" className={getMobileNavStyle}>
            <span className="material-symbols-outlined text-[24px]">group</span>
            <span className="mt-1 text-xs text-center w-full">Users</span>
          </NavLink>
          
          <NavLink to="/admin/listings" className={getMobileNavStyle}>
            <span className="material-symbols-outlined text-[24px]">camera</span>
            <span className="mt-1 text-xs text-center w-full">Listings</span>
          </NavLink>

          <NavLink to="/admin/promotions" className={getMobileNavStyle}>
            <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
            <span className="mt-1 text-xs text-center w-full">Voucher</span>
          </NavLink>
          
          <NavLink to="/admin/finance" className={getMobileNavStyle}>
            <span className="material-symbols-outlined text-[24px]">payments</span>
            <span className="mt-1 text-xs text-center w-full">Finance</span>
          </NavLink>
        </div>
      </nav>

    </div>
  );
}

export default AdminLayout;