import { NavLink, Link, useLocation } from "react-router-dom";
import "../../styles/profile-dashboard.css";
import { getRoleFromToken } from "../../utils/auth";

interface SidebarItem {
  icon: string;
  label: string;
  to: string;
  end?: boolean;
}

const RENTER_MENU: SidebarItem[] = [
  { icon: "home", label: "Trang chủ", to: "/", end: true },
  { icon: "person", label: "Hồ sơ của tôi", to: "/profile" },
  { icon: "shopping_cart", label: "Giỏ hàng", to: "/cart" },
  { icon: "receipt_long", label: "Đơn của tôi", to: "/history" },
  { icon: "chat", label: "Tin nhắn", to: "/chat" },
];

const LENDER_MENU: SidebarItem[] = [
  {
    icon: "assignment",
    label: "Đơn cho thuê",
    to: "/dashboard/orders",
    end: true,
  },
  {
    icon: "account_balance_wallet",
    label: "Ví của tôi",
    to: "/dashboard/wallet",
  },
  {
    icon: "confirmation_number",
    label: "Voucher của tôi",
    to: "/dashboard/promotions",
  },
  { icon: "camera", label: "Thiết bị của tôi", to: "/dashboard/my-listings" },
  { icon: "bar_chart", label: "Thống kê", to: "/dashboard/stats" },
];

export default function ProfileSidebar() {
  const location = useLocation();
  const rawRole = getRoleFromToken(); // Lấy role gốc từ token

  // Ép chuẩn chuỗi viết HOA để tránh tuyệt đối lỗi lệch ký tự giữa FE và BE
  const role = rawRole ? rawRole.toUpperCase() : null;
  const isOwner = role === "OWNER";

  return (
    <aside className="pdb-sidebar">
      {/* Brand & Logo */}
      <Link to="/" className="pdb-sidebar__brand">
        <div className="pdb-sidebar__logo">
          <span className="material-symbols-outlined">camera</span>
        </div>
        <span className="pdb-sidebar__brand-text">LensLease VN</span>
      </Link>

      {/* Role badge */}
      <div className="pdb-sidebar__role-badge">
        Đang xem: {isOwner ? "Chủ thiết bị" : "Người đi thuê"}
      </div>

      {/* ── RENTER SECTION ── */}
      {/* Chỉ hiển thị tiêu đề phân mục "Khi tôi đi thuê" nếu tài khoản là OWNER */}
      {isOwner && (
        <div className="pdb-sidebar__section-label">Khi tôi đi thuê</div>
      )}
      
      <nav className="pdb-sidebar__nav">
        {RENTER_MENU.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `pdb-sidebar__link ${isActive ? "active" : ""}`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* ── LENDER SECTION ── */}
      {/* Chỉ hiển thị các tab quản lý cho thuê nếu tài khoản là OWNER */}
      {isOwner && (
        <>
          <div className="pdb-sidebar__section-label">Khi tôi cho thuê</div>
          <nav className="pdb-sidebar__nav">
            {LENDER_MENU.map((item) => {
              const isCustomActive =
                item.to === "/dashboard/my-listings" &&
                location.pathname === "/dashboard/new-listing";

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `pdb-sidebar__link ${isActive || isCustomActive ? "active" : ""}`
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </>
      )}

      {/* Bottom Actions */}
      <div className="pdb-sidebar__bottom">
        {/* Nút đăng tin nhanh chỉ dành riêng cho OWNER */}
        {isOwner && (
          <Link to="/dashboard/new-listing" className="pdb-sidebar__cta">
            <span className="material-symbols-outlined">add</span>
            Đăng tin cho thuê
          </Link>
        )}
        <Link to="/" className="pdb-sidebar__home-link">
          <span className="material-symbols-outlined">home</span>
          Về trang chủ
        </Link>
      </div>
    </aside>
  );
}