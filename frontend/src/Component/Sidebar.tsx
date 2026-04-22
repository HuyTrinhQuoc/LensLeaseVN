import React from 'react';

const menuItems = [
  { icon: 'dashboard', label: 'Tổng quan', active: false },
  { icon: 'camera_roll', label: 'Đơn thuê', active: true },
  { icon: 'account_balance_wallet', label: 'Ví của tôi', active: false },
  { icon: 'gavel', label: 'Tranh chấp', active: false },
  { icon: 'settings', label: 'Cài đặt', active: false },
];

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col py-8 px-4 bg-slate-50 z-50">
      <div className="mb-10 px-4">
        <h1 className="text-xl font-bold tracking-tighter text-primary">LensLease VN</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">Technical Curator</p>
      </div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              item.active 
              ? 'text-primary font-bold border-r-4 border-primary bg-slate-200' 
              : 'text-slate-500 font-medium hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="mt-auto px-4">
        <button className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-transform shadow-lg shadow-primary/20">
          Đăng thiết bị
        </button>
      </div>
    </aside>
  );
}