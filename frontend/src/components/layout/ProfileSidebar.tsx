import { NavLink, Link } from 'react-router-dom';
import '../../styles/profile-dashboard.css';

/**
 * Sidebar cho trang User Profile / Dashboard.
 * Phân chia 2 khu vực:
 *  – "KHI TÔI ĐI THUÊ"  (Renter view)
 *  – "KHI TÔI CHO THUÊ" (Owner / Lender view)
 */

interface SidebarItem {
  icon: string;
  label: string;
  to: string;
  end?: boolean;
}

const RENTER_MENU: SidebarItem[] = [
  { icon: 'home',             label: 'Trang chủ',     to: '/',               end: true },
  { icon: 'shopping_cart',    label: 'Giỏ hàng',      to: '/cart' },
  { icon: 'receipt_long',     label: 'Đơn của tôi',   to: '/history' },
  { icon: 'chat',             label: 'Tin nhắn',      to: '/chat' },
];

const LENDER_MENU: SidebarItem[] = [
  { icon: 'assignment',       label: 'Đơn cho thuê',  to: '/dashboard/orders', end: true },
  { icon: 'account_balance_wallet', label: 'Ví của tôi', to: '/dashboard/wallet' },
  { icon: 'camera',           label: 'Thiết bị của tôi', to: '/dashboard/my-listings' },
  { icon: 'bar_chart',        label: 'Thống kê',      to: '/dashboard/stats' },
];

export default function ProfileSidebar() {
  return (
    <aside className="pdb-sidebar">
      {/* Brand */}
      <Link to="/" className="pdb-sidebar__brand">
        <div className="pdb-sidebar__logo">
          <span className="material-symbols-outlined">camera</span>
        </div>
        <span className="pdb-sidebar__brand-text">LensLease VN</span>
      </Link>

      {/* Role badge */}
      <div className="pdb-sidebar__role-badge">
        Đang xem: Chủ thiết bị
      </div>

      {/* ── RENTER SECTION ── */}
      <div className="pdb-sidebar__section-label">Khi tôi đi thuê</div>
      <nav className="pdb-sidebar__nav">
        {RENTER_MENU.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `pdb-sidebar__link ${isActive ? 'active' : ''}`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* ── LENDER SECTION ── */}
      <div className="pdb-sidebar__section-label">Khi tôi cho thuê</div>
      <nav className="pdb-sidebar__nav">
        {LENDER_MENU.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `pdb-sidebar__link ${isActive ? 'active' : ''}`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="pdb-sidebar__bottom">
        <Link to="/dashboard/new-listing" className="pdb-sidebar__cta">
          <span className="material-symbols-outlined">add</span>
          Đăng tin cho thuê
        </Link>
        <Link to="/" className="pdb-sidebar__home-link">
          <span className="material-symbols-outlined">home</span>
          Về trang chủ
        </Link>
      </div>
    </aside>
  );
}
