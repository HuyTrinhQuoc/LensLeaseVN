import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <div className="bg-surface-container-low min-h-screen flex">
      {/* Cố định Sidebar bên trái */}
      <Sidebar />
      
      {/* Phần nội dung chính được đẩy sang phải để tránh đè lên Sidebar */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Topbar đơn giản cho Dashboard */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 z-10">
          <h2 className="text-xl font-semibold text-gray-800">Quản lý hệ thống</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Xin chào, Đối tác</span>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              P
            </div>
          </div>
        </header>

        {/* Khu vực render trang con */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
