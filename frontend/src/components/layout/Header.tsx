import { Link, useLocation } from 'react-router-dom';
import '../../styles/shared-layout.css';

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  );
}

export default function Header() {
  const location = useLocation();

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

          {/* Search */}
          <div className="dark-header__search">
            <input type="text" placeholder="Tìm kiếm..." />
            <button className="dark-header__search-btn">
              <Icon name="search" />
            </button>
          </div>

          {/* Actions */}
          <div className="dark-header__actions">
            <a href="tel:19006750" className="dark-header__action-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Icon name="call" className="dark-header__action-icon" />
              <div className="dark-header__action-text">
                <span className="label">Gọi mua hàng</span>
                <strong className="value">1900 6750</strong>
              </div>
            </a>

            <Link to="/login" className="dark-header__action-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Icon name="person" className="dark-header__action-icon" />
              <div className="dark-header__action-text">
                <span className="label">Tài khoản</span>
                <strong className="value">Đăng nhập</strong>
              </div>
            </Link>

            <Link to="/cart" className="dark-header__cart-btn">
              <div className="dark-header__cart-icon-wrapper">
                <Icon name="shopping_basket" />
                <span className="dark-header__cart-badge">0</span>
              </div>
              <span>Giỏ hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="dark-header__bottom">
        <div className="dark-header__container dark-header__bottom-inner">
          {/* Category Menu */}
          <div className="dark-header__category">
            <Icon name="menu" />
            <span>DANH MỤC SẢN PHẨM</span>
          </div>

          {/* Navigation */}
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