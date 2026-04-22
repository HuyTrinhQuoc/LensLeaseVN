import { Link } from 'react-router-dom';
import '../../styles/shared-layout.css';

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="light-footer">
      {/* ── Newsletter Section ── */}
      <div className="light-footer__newsletter">
        <div className="light-footer__container light-footer__newsletter-inner">
          <div className="light-footer__newsletter-text">
            <h3>ĐĂNG KÝ ĐỂ NHẬN TIN TỨC KHUYẾN MÃI MỚI NHẤT</h3>
            <p>Bạn hãy để lại email để không bỏ lỡ hàng ngàn sản phẩm và các chương trình khuyến mại khác</p>
          </div>
          <div className="light-footer__newsletter-form">
            <input type="email" placeholder="Nhập email của bạn" />
            <button type="button">Gửi</button>
          </div>
        </div>
      </div>

      {/* ── Main Footer ── */}
      <div className="light-footer__main">
        <div className="light-footer__container light-footer__main-inner">
          {/* Column 1: Brand Info */}
          <div className="light-footer__col light-footer__col-brand">
            <Link to="/" className="light-footer__brand">
              <div className="light-footer__brand-icon">
                 <Icon name="camera" />
              </div>
              <h2>LENSLEASE</h2>
            </Link>
            <ul className="light-footer__contact-list">
              <li>
                <Icon name="near_me" />
                <span>Tầng 6, Tòa nhà Ladeco, 266 Đội Cấn, Quận Ba Đình, TP Hà Nội</span>
              </li>
              <li>
                <Icon name="call" />
                <span>1900 6750</span>
              </li>
              <li>
                <Icon name="mail" />
                <span>support@lenslease.vn</span>
              </li>
            </ul>
          </div>

          {/* Column 2: VỀ CHÚNG TÔI */}
          <div className="light-footer__col">
            <h4>VỀ CHÚNG TÔI</h4>
            <ul className="light-footer__links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/about">Giới thiệu</Link></li>
              <li><Link to="/products">Sản phẩm</Link></li>
              <li><Link to="/news">Tin tức</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Column 3: CHÍNH SÁCH */}
          <div className="light-footer__col">
            <h4>CHÍNH SÁCH</h4>
            <ul className="light-footer__links">
              <li><Link to="/policy/shipping">Chính sách giao hàng</Link></li>
              <li><Link to="/policy/return">Chính sách đổi trả</Link></li>
              <li><Link to="/policy/sales">Chính sách bán hàng</Link></li>
              <li><Link to="/policy/installment">Hướng dẫn trả góp</Link></li>
            </ul>
          </div>

          {/* Column 4: TƯ VẤN KHÁCH HÀNG */}
          <div className="light-footer__col">
            <h4>TƯ VẤN KHÁCH HÀNG</h4>
            <ul className="light-footer__support-list">
              <li><span>Mua hàng:</span> <strong>1900 6750</strong></li>
              <li><span>Khiếu nại:</span> <strong>1900 6750</strong></li>
              <li><span>Bảo hành:</span> <strong>1900 6750</strong></li>
            </ul>

            <h4 style={{ marginTop: '32px' }}>PHƯƠNG THỨC THANH TOÁN</h4>
            <div className="light-footer__payment-methods">
              <div className="payment-icon mastercard">M</div>
              <div className="payment-icon visa">VISA</div>
              <div className="payment-icon jcb">JCB</div>
              <div className="payment-icon zalopay">ZaloPay</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="light-footer__bottom">
        <div className="light-footer__container">
          <p>&copy; Bản quyền thuộc về LensLeaseVN | Cung cấp bởi LensLease Team</p>
        </div>
      </div>
    </footer>
  );
}
