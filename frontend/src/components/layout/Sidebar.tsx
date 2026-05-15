import { NavLink } from 'react-router-dom';

const menuItems: { icon: string; label: string; to: string; end?: boolean }[] = [
  { icon: 'camera_roll', label: 'Đơn cho thuê', to: '/lender/orders', end: true },
  { icon: 'account_balance_wallet', label: 'Ví của tôi', to: '/wallet' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-slate-50 px-4 py-8">
      <div className="mb-10 px-4">
        <NavLink to="/lender/orders" className="block">
          <h1 className="text-xl font-bold tracking-tighter text-primary">LensLease VN</h1>
        </NavLink>
        <p className="mt-1 text-xs font-medium text-on-surface-variant">Chủ thiết bị</p>
      </div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                isActive
                  ? 'border-r-4 border-primary bg-slate-200 font-bold text-primary'
                  : 'font-medium text-slate-500 hover:bg-slate-200'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto space-y-2 px-4">
        <NavLink
          to="/products"
          className="flex w-full items-center justify-center rounded-xl bg-primary py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition-transform active:scale-95"
        >
          Đăng thiết bị
        </NavLink>
        <NavLink to="/" className="block text-center text-xs font-semibold text-slate-500 hover:text-primary">
          ← Về trang chủ
        </NavLink>
      </div>
    </aside>
  );
}
