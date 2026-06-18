import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProfileSidebar from './ProfileSidebar';
import '../../styles/profile-dashboard.css';

/**
 * ProfileDashboardLayout — Layout chính cho khu vực User Profile / Dashboard.
 * Bao gồm:
 *  - Sidebar (trái) với menu Renter + Lender
 *  - Top bar với page title + workspace badge + thông tin user + notifications
 *  - Content area (Outlet)
 */

/** Mapping route → page title */
const PAGE_TITLES: Record<string, string> = {
  '/dashboard/orders':      'Đơn cho thuê',
  '/dashboard/wallet':      'Ví của tôi',
  '/dashboard/my-listings': 'Thiết bị của tôi',
  '/dashboard/stats':       'Thống kê',
  '/profile':               'Hồ sơ của tôi',
};

export default function ProfileDashboardLayout() {
  const location = useLocation();
  const [userName, setUserName] = useState('Người dùng');
  const [avatarUrl, setAvatarUrl] = useState('https://placehold.co/80x80/e2e8f0/64748b?text=U');

  useEffect(() => {
    // Gọi API lấy thông tin user thật
    import('../../services/user.service').then(({ userService }) => {
      userService.getMe()
        .then(res => {
          if (res.data) {
            setUserName(res.data.full_name || 'Người dùng');
            if (res.data.avatar_url) {
              setAvatarUrl(res.data.avatar_url);
            }
          }
        })
        .catch(() => {
          const savedName = localStorage.getItem('userName');
          const savedAvatar = localStorage.getItem('avatar_url');
          if (savedName) setUserName(savedName);
          if (savedAvatar) setAvatarUrl(savedAvatar);
        });
    });
  }, []);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

  return (
    <div className="pdb">
      {/* Sidebar */}
      <ProfileSidebar />

      {/* Main */}
      <div className="pdb-main">
        {/* Top bar */}
        <header className="pdb-topbar">
          <div className="pdb-topbar__left">
            <h1 className="pdb-topbar__title">{pageTitle}</h1>
            <div className="pdb-topbar__workspace">
              <span className="pdb-topbar__workspace-dot" />
              WORKSPACE: CHỦ THIẾT BỊ
            </div>
          </div>

          <div className="pdb-topbar__right">
            {/* Notification */}
            <button className="pdb-topbar__icon-btn" title="Thông báo">
              <span className="material-symbols-outlined">notifications</span>
              <span className="pdb-topbar__notif-dot" />
            </button>

            {/* Help */}
            <button className="pdb-topbar__icon-btn" title="Trợ giúp">
              <span className="material-symbols-outlined">help_outline</span>
            </button>

            {/* User */}
            <div className="pdb-topbar__user">
              <span className="pdb-topbar__user-name">Xin chào, {userName}</span>
              <img
                src={avatarUrl}
                alt={userName}
                className="pdb-topbar__avatar"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="pdb-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
