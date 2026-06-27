import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../../styles/profile-hub.css';
import { getAuthToken, getRoleFromToken } from '../../utils/auth';
import { userService } from '../../services/user.service';
import { ownerApplicationService } from '../../services/owner-application.service';

export default function ProfileHubLayout() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Người dùng');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [ownerAppPending, setOwnerAppPending] = useState(false);
  const role = getRoleFromToken()?.toUpperCase() || 'USER';
  const isOwner = role === 'OWNER';
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login', { replace: true });
      return;
    }

    void userService.getMe().then((res) => {
      setUserName(res.data.full_name || res.data.email || 'Người dùng');
      if (res.data.avatar_url) setAvatarUrl(res.data.avatar_url);
    });

    if (!isOwner && !isAdmin) {
      void ownerApplicationService.getMine().then((res) => {
        setOwnerAppPending(res.data?.data?.status === 'PENDING');
      });
    }
  }, [navigate, isOwner, isAdmin]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `profile-hub__nav-item${isActive ? ' profile-hub__nav-item--active' : ''}`;

  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="profile-hub">
      <div className="profile-hub__container">
        <aside className="profile-hub__sidebar">
          <div className="profile-hub__user">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="profile-hub__avatar" />
            ) : (
              <div className="profile-hub__avatar">{initial}</div>
            )}
            <div className="profile-hub__user-meta">
              <div className="profile-hub__user-name">{userName}</div>
              <Link to="/profile/account" className="profile-hub__edit-link">
                Sửa hồ sơ
              </Link>
            </div>
          </div>

          <nav className="profile-hub__nav">
            <div className="profile-hub__nav-section">Khi tôi đi thuê</div>
            <NavLink to="/profile" end className={navClass}>
              <span className="material-symbols-outlined">person</span>
              Tổng quan tài khoản
            </NavLink>
            <NavLink to="/profile/account" className={navClass}>
              <span className="material-symbols-outlined">badge</span>
              Thông tin cá nhân
            </NavLink>
            <Link to="/history" className="profile-hub__nav-item">
              <span className="material-symbols-outlined">receipt_long</span>
              Đơn thuê của tôi
            </Link>
            <Link to="/cart" className="profile-hub__nav-item">
              <span className="material-symbols-outlined">shopping_cart</span>
              Giỏ hàng
            </Link>
            <Link to="/wallet" className="profile-hub__nav-item">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              Ví ký quỹ
            </Link>
            <Link to="/Verification" className="profile-hub__nav-item">
              <span className="material-symbols-outlined">verified_user</span>
              Xác minh KYC (thuê máy)
            </Link>
            <Link to="/chat" className="profile-hub__nav-item">
              <span className="material-symbols-outlined">chat</span>
              Tin nhắn
            </Link>

            <div className="profile-hub__nav-section">Khi tôi cho thuê</div>
            {isOwner || isAdmin ? (
              <>
                <Link to="/dashboard/my-listings" className="profile-hub__nav-item">
                  <span className="material-symbols-outlined">photo_camera</span>
                  Thiết bị của tôi
                </Link>
                <Link to="/dashboard/new-listing" className="profile-hub__nav-item">
                  <span className="material-symbols-outlined">add_circle</span>
                  Đăng tin mới
                </Link>
                <Link to="/dashboard/orders" className="profile-hub__nav-item">
                  <span className="material-symbols-outlined">assignment</span>
                  Đơn cho thuê
                </Link>
                <Link to="/dashboard/stats" className="profile-hub__nav-item">
                  <span className="material-symbols-outlined">bar_chart</span>
                  Doanh thu
                </Link>
              </>
            ) : (
              <NavLink to="/profile/become-owner" className={navClass}>
                <span className="material-symbols-outlined">storefront</span>
                Trở thành chủ cho thuê
                {ownerAppPending ? <span className="profile-hub__nav-badge">Chờ duyệt</span> : null}
              </NavLink>
            )}

            {isAdmin ? (
              <>
                <div className="profile-hub__nav-section">Quản trị</div>
                <Link to="/admin/dashboard" className="profile-hub__nav-item">
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                  Trang Admin
                </Link>
              </>
            ) : null}
          </nav>
        </aside>

        <div className="profile-hub__main">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
