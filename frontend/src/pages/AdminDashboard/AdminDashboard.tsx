import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-background mb-2 tracking-tight">Tổng quan hệ thống</h1>
        <p className="text-base text-on-surface-variant">Theo dõi các chỉ số quan trọng và nhiệm vụ cấp bách của LensLease VN.</p>
      </div>

      {/* KPIs Grid (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* KPI: GMV */}
        <div className="bg-surface-container-lowest  rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-on-surface-variant">Tổng doanh thu (GMV)</p>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[22px]">account_balance_wallet</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-on-surface mb-2">2.45B ₫</h3>
          <div className="flex items-center gap-1.5 text-status-success font-mono text-sm font-medium">
            <span className="material-symbols-outlined text-base">trending_up</span>
            <span>+12.5%</span>
          </div>
        </div>

        {/* KPI: Profit */}
        <div className="bg-surface-container-lowest  rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-on-surface-variant">Lợi nhuận</p>
            <div className="w-10 h-10 rounded-full bg-status-success/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-status-success text-[22px]">payments</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-on-surface mb-2">367M ₫</h3>
          <div className="flex items-center gap-1.5 text-status-success font-mono text-sm font-medium">
            <span className="material-symbols-outlined text-base">trending_up</span>
            <span>+8.2%</span>
          </div>
        </div>

        {/* KPI: Active Bookings */}
        <div className="bg-surface-container-lowest  rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-on-surface-variant">Đơn đang diễn ra</p>
            <div className="w-10 h-10 rounded-full bg-status-info/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-status-info text-[22px]">local_shipping</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-on-surface mb-2">1,204</h3>
          <div className="flex items-center gap-1.5 text-on-surface-variant font-mono text-sm font-medium">
            <span className="material-symbols-outlined text-base">trending_flat</span>
            <span>-1.2%</span>
          </div>
        </div>

        {/* KPI: New Users */}
        <div className="bg-surface-container-lowest  rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-on-surface-variant">Người dùng mới</p>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[22px]">group_add</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-on-surface mb-2">458</h3>
          <div className="flex items-center gap-1.5 text-status-success font-mono text-sm font-medium">
            <span className="material-symbols-outlined text-base">trending_up</span>
            <span>+24.1%</span>
          </div>
        </div>

        {/* KPI: Escrow Balance (Nổi bật hơn) */}
        <div className="bg-primary rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
          <div className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12">
            <span className="material-symbols-outlined text-[120px]">lock</span>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-on-primary/90">Tiền tạm giữ (Escrow)</p>
              <span className="material-symbols-outlined text-on-primary">shield</span>
            </div>
            <h3 className="text-3xl font-extrabold text-on-primary mb-2">8.5B ₫</h3>
            <div className="flex items-center gap-1.5 text-on-primary/90 font-mono text-sm font-medium mt-1">
              <span className="material-symbols-outlined text-base">verified_user</span>
              <span>Đã bảo mật 100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Urgent Tasks & Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Urgent Tasks */}
        <div className="lg:col-span-1 bg-surface-container-lowest  rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6 border-b border-border-subtle pb-4">
            <div className="w-8 h-8 rounded-full bg-status-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-status-error text-sm">warning</span>
            </div>
            <h2 className="text-lg font-bold text-on-surface">Nhiệm vụ cấp bách</h2>
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            {/* Task Item 1 */}
            <div className="flex items-center justify-between p-4 bg-surface-container hover:bg-surface-container-highest transition-colors rounded-xl cursor-pointer  group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-status-error" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                </div>
                <div>
                  <p className="text-base font-semibold text-on-surface">Yêu cầu rút tiền</p>
                  <p className="font-mono text-sm text-status-error mt-0.5">Cần xử lý trong 24h</p>
                </div>
              </div>
              <span className="bg-status-error text-on-error font-bold px-3 py-1 rounded-full text-xs shadow-sm">12</span>
            </div>
            
            {/* Task Item 2 */}
            <div className="flex items-center justify-between p-4 bg-surface-container hover:bg-surface-container-highest transition-colors rounded-xl cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-status-warning" style={{ fontVariationSettings: "'FILL' 1" }}>rule</span>
                </div>
                <div>
                  <p className="text-base font-semibold text-on-surface">Duyệt tin đăng mới</p>
                  <p className="font-mono text-sm text-on-surface-variant mt-0.5">Thiết bị giá trị cao</p>
                </div>
              </div>
              <span className="bg-status-warning text-white font-bold px-3 py-1 rounded-full text-xs shadow-sm">45</span>
            </div>
            
            {/* Task Item 3 */}
            <div className="flex items-center justify-between p-4 bg-surface-container hover:bg-surface-container-highest transition-colors rounded-xl cursor-pointer  group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                </div>
                <div>
                  <p className="text-base font-semibold text-on-surface">Tranh chấp đang mở</p>
                  <p className="font-mono text-sm text-on-surface-variant mt-0.5">Hư hỏng thiết bị</p>
                </div>
              </div>
              <span className="bg-primary text-white font-bold px-3 py-1 rounded-full text-xs shadow-sm">3</span>
            </div>
          </div>
        </div>

        {/* Trend Chart Placeholder */}
        <div className="lg:col-span-2 bg-surface-container-lowest  rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-border-subtle pb-4">
            <h2 className="text-lg font-bold text-on-surface">Đơn hàng theo ngày (Tháng này)</h2>
            <button className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
              Xem chi tiết <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
          <div className="flex-1 bg-surface-container rounded-xl  flex items-end justify-between p-6 gap-3 relative min-h-[240px]">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 pointer-events-none opacity-20">
              <div className="w-full border-t-2 border-outline border-dashed"></div>
              <div className="w-full border-t-2 border-outline border-dashed"></div>
              <div className="w-full border-t-2 border-outline border-dashed"></div>
              <div className="w-full border-t-2 border-outline border-dashed"></div>
            </div>
            
            {/* Bars */}
            <div className="w-full h-[40%] bg-primary/40 hover:bg-primary transition-all duration-300 rounded-t-md cursor-pointer"></div>
            <div className="w-full h-[60%] bg-primary/40 hover:bg-primary transition-all duration-300 rounded-t-md cursor-pointer"></div>
            <div className="w-full h-[55%] bg-primary/40 hover:bg-primary transition-all duration-300 rounded-t-md cursor-pointer"></div>
            <div className="w-full h-[85%] bg-primary rounded-t-md shadow-[0_0_15px_rgba(0,86,210,0.4)] cursor-pointer relative group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Đỉnh điểm</div>
            </div>
            <div className="w-full h-[45%] bg-primary/40 hover:bg-primary transition-all duration-300 rounded-t-md cursor-pointer"></div>
            <div className="w-full h-[30%] bg-primary/40 hover:bg-primary transition-all duration-300 rounded-t-md cursor-pointer"></div>
            <div className="w-full h-[70%] bg-primary/40 hover:bg-primary transition-all duration-300 rounded-t-md cursor-pointer"></div>
          </div>
          <div className="flex justify-between mt-4 text-on-surface-variant font-mono text-sm px-2 font-medium">
            <span>01/10</span>
            <span>15/10</span>
            <span>30/10</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Categories */}
      <div className="bg-surface-container-lowest  rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-on-surface">Danh mục phổ biến</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category: Body */}
          <div className="flex items-center gap-5 p-5  rounded-xl hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            </div>
            <div>
              <p className="text-base font-bold text-on-surface mb-0.5">Thân máy (Body)</p>
              <p className="font-mono text-sm text-on-surface-variant">4,520 lượt thuê</p>
            </div>
          </div>
          {/* Category: Lens */}
          <div className="flex items-center gap-5 p-5  rounded-xl hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>camera</span>
            </div>
            <div>
              <p className="text-base font-bold text-on-surface mb-0.5">Ống kính (Lens)</p>
              <p className="font-mono text-sm text-on-surface-variant">8,105 lượt thuê</p>
            </div>
          </div>
          {/* Category: Drone */}
          <div className="flex items-center gap-5 p-5  rounded-xl hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>flight</span>
            </div>
            <div>
              <p className="text-base font-bold text-on-surface mb-0.5">Flycam (Drone)</p>
              <p className="font-mono text-sm text-on-surface-variant">2,340 lượt thuê</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;