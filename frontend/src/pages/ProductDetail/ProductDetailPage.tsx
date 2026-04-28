import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ArrowLeft, ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/footer'
import api from '../../services/api';
import '../../styles/product-detail.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rentalDays, setRentalDays] = useState(1);
  const [startDate, setStartDate] = useState('');
const [selectedDates, setSelectedDates] = useState([10, 11, 12]); // mock đang chọn 3 ngày
const [pendingDates] = useState([7, 8]); // mock đang chờ (disabled)
const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/lenses/${id}`);
        setProduct(response.data.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="product-detail-main">
    
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Đang tải thông tin sản phẩm...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-detail-main">
        <div className="error-container">
          <div className="error-content">
            <h2 className="error-title">Không tìm thấy sản phẩm</h2>
            <p className="error-message">{error}</p>
            <Link to="/products" className="error-link">
              ← Quay lại danh sách sản phẩm
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Gallery images from lens_images
  const galleryImages = product.lens_images?.length > 0 
    ? product.lens_images.map(img => img.image_url)
    : [product.thumbnail || 'https://images.unsplash.com/photo-1606986628024-07d43a53676e?w=800&h=800&fit=crop'];

  // Mock accessories (có thể thay bằng API call sau)
  const accessories = [
    { id: 'acc-1', name: 'Lens 50mm f/1.8', price: 500000, image: 'https://images.unsplash.com/photo-1602394247192-ddfcc5b89b80?w=300&h=300&fit=crop' },
    { id: 'acc-2', name: 'Tripod Carbon Fiber', price: 350000, image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=300&h=300&fit=crop' },
    { id: 'acc-3', name: 'Camera Bag Professional', price: 450000, image: 'https://images.unsplash.com/photo-1614008375890-cb53b6c5f8d5?w=300&h=300&fit=crop' },
  ];

  // Specifications from lens_specs
  const specs = product.specs ? [
    { label: 'Focal Length', value: product.specs.focal_length || 'N/A' },
    { label: 'Max Aperture', value: product.specs.max_aperture || 'N/A' },
    { label: 'Mount', value: product.specs.mount || 'N/A' },
    { label: 'Sensor Format', value: product.specs.sensor_format || 'N/A' },
  ] : [];

  const totalPrice = (product.price_per_day || 0) * rentalDays;
const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const days = [];

  // padding đầu tuần
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  return days;
};

const days = getDaysInMonth(currentMonth);
  return (
    <main className="product-detail-main">

      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <Link to="/products" className="breadcrumb-link">
          <ArrowLeft />
          Quay Lại Thiết Bị
        </Link>
      </div>

      {/* Main Product Section */}
      <section className="product-section">
        <div className="product-grid">
          {/* Image Gallery - Left Side */}
          <div className="gallery-container">
            {/* Main Image */}
            <div className="main-image-wrapper">
              <img
                src={galleryImages[selectedImage]}
                alt={product.title}
              />
              {/* Navigation Buttons */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                    className="image-nav-button prev"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                    className="image-nav-button next"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {galleryImages.length > 1 && (
              <div className="thumbnail-gallery">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`thumbnail-button ${selectedImage === idx ? 'active' : ''}`}
                  >
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Right Side */}
          <div className="product-info">
            {/* Title and Rating */}
            <div className="product-header">
              <span className="product-brand">{product.brand}</span>
              <h1 className="product-title">{product.title}</h1>

              {/* Rating */}
              <div className="rating-container">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={i < Math.floor(product.rating_avg || 0) ? 'fill-current' : ''}
                    />
                  ))}
                </div>
                <span className="rating-text">
                  {(product.rating_avg || 0).toFixed(1)}/5 ({product.rating_count || 0} đánh giá)
                </span>
              </div>
            </div>

            {/* Price Section */}
            <div className="price-section">
              <div className="price-label">Giá thuê mỗi ngày</div>
              <div className="price-amount">
                {(product.price_per_day || 0).toLocaleString('vi-VN')}0.000 VND
              </div>
              <div className="price-details">
                <div>Tiền đặt cọc: {((product.price_per_day || 0) * 3).toLocaleString('vi-VN')}0.000 VND</div>
                <div>Bảo hiểm: {((product.price_per_day || 0) * 0.5).toLocaleString('vi-VN')}0.000 VND/ngày</div>
              </div>
                 {/* Quick Info */}
            <div className="quick-info">
              <div className="info-row">
                <span className="info-label">Tình Trạng:</span>
                <span className={`info-value ${product.available ? 'available' : 'unavailable'}`}>
                  {product.available ? 'Có Sẵn' : 'Hết Hàng'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Giao Hàng:</span>
                <span className="info-value">1-2 Ngày Làm Việc</span>
              </div>
              <div className="info-row">
                <span className="info-label">Hỗ Trợ:</span>
                <span className="info-value">24/7 Tiếng Việt</span>
              </div>
            </div>
            </div>

            {/* Rental Period Selector */}
            <div className="rental-selector">
              <h3>Chọn Thời Gian Thuê</h3>
{/* Availability Calendar */}
<div className="availability-calendar">
  <div className="calendar-header">
    <button onClick={() =>
      setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))
    }>
      <ChevronLeft />
    </button>

    <span>
      {currentMonth.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
    </span>

    <button onClick={() =>
      setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))
    }>
      <ChevronRight />
    </button>
  </div>

  {/* Week days */}
  <div className="calendar-weekdays">
    {['CN','T2','T3','T4','T5','T6','T7'].map((d) => (
      <div key={d}>{d}</div>
    ))}
  </div>

  {/* Days */}
<div className="calendar-grid">
  {days.map((day, idx) => {
    const isSelected = selectedDates.includes(day);
    const isPending = pendingDates.includes(day);

    return (
      <button
        key={idx}
        disabled={!day || isPending}
        onClick={() => {
          if (!day || isPending) return;

          setSelectedDates((prev) =>
            prev.includes(day)
              ? prev.filter((d) => d !== day)
              : [...prev, day]
          );
        }}
        className={`calendar-day
          ${!day ? 'empty' : ''}
          ${isSelected ? 'selected' : ''}
          ${isPending ? 'pending' : ''}
        `}
      >
        {day || ''}
      </button>
    );
  })}
</div>

  {/* Legend */}
 <div className="calendar-legend">
  <span>
    <span className="dot selected"></span> Đang chọn
  </span>
  <span>
    <span className="dot pending"></span> Đang chờ
  </span>
  <span>
    <span className="dot"></span> Có thể chọn
  </span>
</div>
</div>
              {/* Total Price */}
              <div className="total-price-box">
                <div className="total-label">Tổng Cộng</div>
                <div className="total-amount">
                  {totalPrice.toLocaleString('vi-VN')}0.000 VND
                </div>
              </div>

              {/* Order Button */}
              <div className="action-buttons-group">
                <button className="order-button">
                  <ShoppingCart />
                  ĐẶT HÀNG NGAY
                </button>
                <button className="wishlist-button">
                  <Heart />
                  Thêm Vào Yêu Thích
                </button>
              </div>
            </div>

         
          </div>
        </div>
      </section>

      {/* Detailed Specifications Section */}
      {specs.length > 0 && (
        <section className="specs-section">
          <div className="specs-container">
            <h2 className="specs-title">Thông Số Kỹ Thuật Chi Tiết</h2>
            <div className="specs-grid">
              {specs.map((spec, idx) => (
                <div key={idx} className="spec-card">
                  <p className="spec-label">{spec.label}</p>
                  <p className="spec-value">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Full Specs Table */}
            <div className="specs-table-wrapper">
              <table className="specs-table">
                <tbody>
                  {[
                    { label: 'Loại', value: product.type },
                    { label: 'Danh Mục', value: product.category },
                    { label: 'Thương Hiệu', value: product.brand },
                    { label: 'Vị Trí', value: product.location },
                    { label: 'Focal Length', value: product.specs?.focal_length || 'N/A' },
                    { label: 'Mount', value: product.specs?.mount || 'N/A' },
                  ].map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.label}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Included Accessories Section */}
      <section className="accessories-section">
        <div className="accessories-container">
          <h2 className="section-title">Quí Phụ Kiện Đi Kèm</h2>
          <div className="accessories-grid">
            {accessories.map((accessory) => (
              <div key={accessory.id} className="accessory-card">
                <div className="accessory-image-wrapper">
                  <img
                    src={accessory.image}
                    alt={accessory.name}
                  />
                </div>
                <div className="accessory-content">
                  <h3 className="accessory-name">
                    {accessory.name}
                  </h3>
                  <div className="accessory-price">
                    {accessory.price.toLocaleString('vi-VN')}0.000 VND/ngày
                  </div>
                  <button className="accessory-button">
                    Thêm Vào
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="description-section">
        <div className="description-container">
          <h2 className="description-title">Mô Tả Sản Phẩm</h2>
          <p className="description-text">
            {product.description}
          </p>
          <p className="description-text">
            Thiết bị chuyên nghiệp được kiểm tra kỹ lưỡng trước khi giao hàng. Đi kèm với toàn bộ phụ kiện cần thiết. 
            Bảo hiểm toàn diện có sẵn để bảo vệ đầu tư của bạn. Đội hỗ trợ 24/7 sẵn sàng giúp bạn.
          </p>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="reviews-container">
          <h2 className="reviews-title">Đánh Giá Khách Hàng</h2>
          <div className="reviews-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="review-card">
                <div className="review-header">
                  <div className="review-stars">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} />
                    ))}
                  </div>
                  <span className="review-title">Sản phẩm tuyệt vời!</span>
                </div>
                <p className="review-text">
                  Thiết bị này vượt quá kỳ vọng. Chất lượng xây dựng tuyệt vời, hình ảnh xuất sắc và hoạt động rất mượt mà.
                </p>
                <p className="review-meta">
                  Bởi Nguyễn Văn A • {Math.floor(Math.random() * 30) + 1} ngày trước
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}