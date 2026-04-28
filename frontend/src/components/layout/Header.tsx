import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/shared-layout.css';

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  );
}

export default function Header() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim().length > 0) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300); // delay 300ms

    return () => clearTimeout(timeout);
  }, [query]);

  const fetchSuggestions = async (q: string) => {
    try {
      const response = await api.get(`/suggestions?q=${q}`);
      console.log('Suggestions response:', response.data);
      
      // Handle array response
const data = Array.isArray(response.data)
  ? response.data.map((item: any) => item.title || item)
  : [];      setSuggestions(data);
      
      // Always show dropdown if there are suggestions
      if (data.length > 0) {
        setShowDropdown(true);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim().length === 0) return;
    
    setShowDropdown(false);
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearchButtonClick = () => {
    handleSearch();
  };

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
          <div className="dark-header__search" style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            />
            
            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  marginTop: '4px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                      color: '#333',
                      fontSize: '14px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}

            <button className="dark-header__search-btn" onClick={handleSearchButtonClick}>
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