import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { lensService } from '../../services/lensService';
import '../../styles/products.css';

interface LensImage {
  id: string;
  image_url: string;
  is_main: boolean;
}

interface Owner {
  id: string;
  full_name: string;
  email: string;
}

interface Product {
  id: string;
  title: string;
  brand: string;
  type: string;
  category: string;
  location: string;
  price_per_day: number;
  thumbnail: string;
  description: string;
  rating_avg: number;
  rating_count: number;
  available: boolean;
  lens_images: LensImage[];
  owner: Owner;
}

interface ApiResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ProductsPage = () => {
  // State for filters
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedAvailable, setSelectedAvailable] = useState('');
  const [sortBy, setSortBy] = useState('');

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // State for data
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter options
  const types = ['Wide', 'Zoom', 'Prime', 'Macro', 'Telophoto'];
  const brands = ['Nikon', 'Sigma', 'Sony', 'Canon'];
  const categories = ['Travel', 'Portrait', 'Macro', 'Sports', 'Landscape', 'General', 'Street', 'Wildlife'];
  const locations = ['Da Nang', 'Hanoi', 'HCM'];

  // Fetch products whenever filters or page changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedType, selectedBrand, selectedCategory, selectedLocation, selectedAvailable, sortBy, itemsPerPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const filters = {
        type: selectedType || undefined,
        brand: selectedBrand || undefined,
        category: selectedCategory || undefined,
        location: selectedLocation || undefined,
        available: selectedAvailable ? selectedAvailable === 'true' : undefined,
        sort: sortBy || undefined,
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
      };

      const response = await lensService.getAll(filters);
      const data: ApiResponse = response.data;

      setProducts(data.data);
      setTotalProducts(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedAvailable('');
    setSortBy('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const getThumbnailImage = (product: Product): string => {
    // Ưu tiên ảnh chính từ lens_images
    const mainImage = product.lens_images?.find(img => img.is_main);
    if (mainImage?.image_url) return mainImage.image_url;
    
    // Nếu không có, dùng thumbnail
    if (product.thumbnail) return product.thumbnail;
    
    // Fallback image
    return '/images/placeholder.jpg';
  };

  return (
    <main className="page">

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>Thiết bị Cho Thuê</h1>
          <p>Duyệt bộ sưu tập thiết bị quay phim chuyên nghiệp của chúng tôi</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container content">
        <div className="layout">

          {/* Sidebar Filters */}
          <aside className={`sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filter-box">

              <div className="filter-header">
                <h2>Bộ Lọc</h2>
                <button onClick={() => setShowFilters(false)}>X</button>
              </div>

              {/* Search */}
              <div className="filter-group">
                <label>Tìm Kiếm</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm thiết bị..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn-outline" onClick={handleSearch} style={{ whiteSpace: 'nowrap' }}>
                    Tìm
                  </button>
                </div>
              </div>

              {/* Type */}
              <div className="filter-group">
                <label>Loại Lens</label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Tất cả</option>
                  {types.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="filter-group">
                <label>Thương Hiệu</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Tất cả</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="filter-group">
                <label>Danh Mục</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Tất cả</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="filter-group">
                <label>Địa Điểm</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Tất cả</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Availability */}
              <div className="filter-group">
                <label>Trạng Thái</label>
                <select
                  value={selectedAvailable}
                  onChange={(e) => {
                    setSelectedAvailable(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Tất cả</option>
                  <option value="true">Có sẵn</option>
                  <option value="false">Không có sẵn</option>
                </select>
              </div>

              {/* Sort */}
              <div className="filter-group">
                <label>Sắp Xếp</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp → Cao</option>
                  <option value="price_desc">Giá: Cao → Thấp</option>
                  <option value="rating">Đánh Giá Cao Nhất</option>
                </select>
              </div>

              {/* Clear */}
              <button
                className="btn-outline"
                onClick={handleResetFilters}
                style={{ width: '100%' }}
              >
                Xóa Bộ Lọc
              </button>
            </div>
          </aside>

          {/* Products */}
          <div className="products">

            {/* Mobile button */}
            <button className="btn-outline mobile-filter" onClick={() => setShowFilters(true)}>
              Hiển Thị Bộ Lọc
            </button>

            {/* Error message */}
            {error && (
              <div style={{ 
                padding: '12px', 
                marginBottom: '16px', 
                backgroundColor: '#fee', 
                borderRadius: '4px', 
                color: '#c33' 
              }}>
                {error}
              </div>
            )}

            {/* Result */}
            <p className="result-text">
              {loading ? 'Đang tải...' : `Hiển thị ${products.length} trong tổng số ${totalProducts} sản phẩm`}
            </p>

            {/* Products Grid */}
            {!loading && products.length > 0 ? (
              <>
                <div className="grid">
                  {products.map((product) => (
                    <div className="card" key={product.id}>
                      <div className="card-img">
                        <img src={getThumbnailImage(product)} alt={product.title} />
                        <div className="badge">{product.category}</div>
                        {!product.available && (
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            Không có sẵn
                          </div>
                        )}
                      </div>

                      <div className="card-body">
                        <p className="brand">{product.brand}</p>
                        <h3>{product.title}</h3>
                        <p className="desc">{product.description}</p>

                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                          📍 {product.location} | {product.type}
                        </div>

                        <div className="price">
                          {parseInt(product.price_per_day.toString()).toLocaleString('vi-VN')} VND/ngày
                        </div>

                        <div className="rating">
                          ★★★★★ ({product.rating_count}) · {product.owner.full_name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '32px',
                    marginBottom: '32px'
                  }}>
                    <button
                      className="btn-outline"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                      ← Trang trước
                    </button>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span>Trang</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                            setCurrentPage(page);
                            window.scrollTo(0, 0);
                          }
                        }}
                        style={{
                          width: '60px',
                          padding: '6px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          textAlign: 'center'
                        }}
                      />
                      <span>/{totalPages}</span>
                    </div>

                    <button
                      className="btn-outline"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                      Trang sau →
                    </button>
                  </div>
                )}
              </>
            ) : !loading ? (
              <div className="empty">
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Thử thay đổi bộ lọc</p>

                <button
                  className="btn-outline"
                  onClick={handleResetFilters}
                >
                  Đặt lại
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <p>Đang tải sản phẩm...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductsPage;