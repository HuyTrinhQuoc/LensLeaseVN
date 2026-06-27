import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import HeaderSearchAutocomplete from './HeaderSearchAutocomplete';
import '../../styles/shared-layout.css';
import { getRoleFromToken } from '../../utils/auth';

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  );
}

export default function Header() {
  const { totalItems } = useCart();
  
  // States quản lý User
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPicture, setUserPicture] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // 👑 GỘP CHUNG LOGIC XỬ LÝ AUTH (LOCAL + GOOGLE OAUTH)
  useEffect(() => {
    // 1. Kiểm tra và xử lý dữ liệu từ Google Redirect trước
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    const urlFullName = params.get('fullName');
    const urlPicture = params.get('picture');

    if (urlToken) {
      localStorage.setItem('token', urlToken);
      localStorage.setItem('email', urlEmail || '');
      localStorage.setItem('fullName', urlFullName || 'Người dùng');
      localStorage.setItem('picture', urlPicture || '');

      setIsLoggedIn(true);
      setUserName(urlFullName || 'Người dùng');
      setUserPicture(urlPicture || '');

      // Xóa query params trên URL một cách mượt mà thông qua React Router
      navigate(location.pathname, { replace: true });
      return; // Dừng lại ở đây vì đã xử lý xong login từ Google
    }

    // 2. Nếu không có query params, kiểm tra localStorage như bình thường
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    if (token) {
      setIsLoggedIn(true);
      const savedName = localStorage.getItem('fullName') || localStorage.getItem('userName');
      const savedPicture = localStorage.getItem('picture');

      if (savedName) setUserName(savedName);
      if (savedPicture) setUserPicture(savedPicture);

      // Nếu có token nhưng thiếu thông tin Name/Avatar -> Gọi API cập nhật
      if (!savedName || !savedPicture) {
        import('../../services/user.service').then(({ userService }) => {
          userService.getMe()
            .then(res => {
              if (res.data) {
                const finalName = res.data.full_name || savedName || 'Người dùng';
                const finalPicture = res.data.avatar_url || savedPicture || '';
                
                setUserName(finalName);
                setUserPicture(finalPicture);
                
                localStorage.setItem('fullName', finalName);
                if (finalPicture) localStorage.setItem('picture', finalPicture);
              }
            })
            .catch((err) => {
              console.error('Lỗi khi lấy thông tin user:', err);
              setUserName(savedName || 'Người dùng');
            });
        });
      }
    } else {
      // Trường hợp không có token (chưa đăng nhập hoặc đã đăng xuất)
      setIsLoggedIn(false);
      setUserName('');
      setUserPicture('');
    }
  }, [location.pathname, location.search, navigate]); // Chạy lại khi chuyển trang hoặc URL có query mới

  // Xử lý click ra ngoài để đóng User Menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.clear(); // Xóa sạch để tránh sót token cũ
    setIsLoggedIn(false);
    setUserName('');
    setUserPicture('');
    setShowUserMenu(false);
    navigate('/');
  };

  /** Trang hồ sơ thật — GET/PATCH /users/me */
  const profilePath = '/profile';

  return (
    <header className="dark-header">
      {/* ── Top Bar ── */}
      <div className="dark-header__top">
        <div className="dark-header__container dark-header__top-inner">
          <span>Giờ mở cửa: 08:30 - 21:30 các ngày trong tuần</span>
          <Link to="/compare" className="dark-header__top-link">
            <Icon name="sync_alt" />
            So sánh sản phẩm
          </Link>
        </div>
      </div>

      {/* ── Middle Bar ── */}
      <div className="dark-header__middle">
        <div className="dark-header__container dark-header__middle-inner">
          {/* Logo */}
          <Link to="/" className="dark-header__brand">
             <div className="dark-header__brand-icon">
                <Icon name="camera" />
             </div>
             <h1>LENSLEASE</h1>
          </Link>

          <HeaderSearchAutocomplete />

          {/* Actions */}
          <div className="dark-header__actions">
            <a href="tel:19006750" className="dark-header__action-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Icon name="call" className="dark-header__action-icon" />
              <div className="dark-header__action-text">
                <span className="label">Gọi mua hàng</span>
                <strong className="value">1900 6750</strong>
              </div>
            </a>

            {/* ================= PHẦN TÀI KHOẢN / ĐĂNG XUẤT ================= */}
            {isLoggedIn ? (
              <div 
                className="dark-header__action-item" 
                style={{ textDecoration: 'none', color: 'inherit', position: 'relative', cursor: 'pointer' }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                ref={userMenuRef}
              >
         
                
                <div className="dark-header__action-text">
                  <span className="label">Xin chào,</span>
                  <strong className="value">{userName}</strong>
                </div>

                {/* Dropdown Đăng Xuất */}
                {showUserMenu && (
                  <div 
                    style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: '10px',
                      backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      minWidth: '150px', zIndex: 1000, overflow: 'hidden'
                    }}
                  >
                    <Link 
                      to={profilePath}
                      onClick={() => setShowUserMenu(false)}
                      style={{ display: 'block', padding: '10px 16px', color: '#333', textDecoration: 'none', fontSize: '14px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      Hồ sơ của tôi
                    </Link>

                    {getRoleFromToken()?.toUpperCase() === 'OWNER' ? (
                      <Link 
                        to="/dashboard/orders"
                        onClick={() => setShowUserMenu(false)}
                        style={{ display: 'block', padding: '10px 16px', color: '#1a3fc7', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eef2ff')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        Quản lý cho thuê
                      </Link>
                    ) : getRoleFromToken()?.toUpperCase() !== 'ADMIN' ? (
                      <>
                        <Link 
                          to="/profile/become-owner"
                          onClick={() => setShowUserMenu(false)}
                          style={{ display: 'block', padding: '10px 16px', color: '#059669', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ecfdf5')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          Cho thuê thiết bị
                        </Link>
                        <Link 
                          to="/history"
                          onClick={() => setShowUserMenu(false)}
                          style={{ display: 'block', padding: '10px 16px', color: '#1a3fc7', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eef2ff')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          Lịch sử thuê
                        </Link>
                      </>
                    ) : (
                      <Link 
                        to="/admin/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        style={{ display: 'block', padding: '10px 16px', color: '#1a3fc7', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}
                      >
                        Trang Admin
                      </Link>
                    )}

                    <button 
                      onClick={handleLogout}
                      style={{ 
                        width: '100%', textAlign: 'left', padding: '10px 16px', color: '#d32f2f', 
                        border: 'none', borderTop: '1px solid #eee', background: 'transparent', 
                        cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff5f5')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="dark-header__action-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Icon name="person" className="dark-header__action-icon" />
                <div className="dark-header__action-text">
                  <span className="label">Tài khoản</span>
                  <strong className="value">Đăng nhập</strong>
                </div>
              </Link>
            )}
            {/* ============================================================== */}

            <Link to="/cart" className="dark-header__cart-btn">
              <div className="dark-header__cart-icon-wrapper">
                <Icon name="shopping_basket" />
                <span className="dark-header__cart-badge">{totalItems}</span>
              </div>
              <span>Giỏ hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="dark-header__bottom">
        <div className="dark-header__container dark-header__bottom-inner">
          <div className="dark-header__category">
            <Icon name="menu" />
            <span>DANH MỤC SẢN PHẨM</span>
          </div>

          <nav className="dark-header__nav">
            <Link to="/" className={location.pathname === '/' ? 'is-active' : ''}>Trang chủ</Link>
            <Link to="/about" className={location.pathname === '/about' ? 'is-active' : ''}>Giới thiệu</Link>
            <Link to="/products" className={location.pathname === '/products' ? 'is-active' : ''}>
               Sản phẩm <Icon name="arrow_drop_down" className="dropdown-icon" />
            </Link>
            <Link to="/news" className={location.pathname === '/news' ? 'is-active' : ''}>Tin tức</Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'is-active' : ''}>Liên hệ</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}