import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

interface CameraSpec {
  focal_length?: string;
  max_aperture?: string;
  mount?: string;
  sensor_format?: string;
}

interface ProductCompareItem {
  id: string;
  name: string; 
  brand: string;
  description?: string;
  price_per_day: number;
  deposit_value: number;
  city: string;
  district: string;
  ward?: string;
  available?: boolean;
  rating_avg?: number | string;
  thumbnail?: string;
  images?: string[] | any;
  category?: {
    id: string;
    name: string;
  };
  specs?: CameraSpec; 
}

export default function ProductComparePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<ProductCompareItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const idsParam = searchParams.get('ids') || '';

  useEffect(() => {
    if (!idsParam) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchCompareData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/lenses/compare?ids=${idsParam}`);
        
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu so sánh từ hệ thống.');
        }

        const resData = await response.json();
        setProducts(resData.data || []);
      } catch (err: any) {
        console.error('Lỗi lấy dữ liệu so sánh:', err);
        setError(err.message || 'Đã có lỗi xảy ra.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompareData();
  }, [idsParam]);

  const handleRemoveProduct = (idToRemove: string) => {
    const idArray = idsParam.split(',').filter(id => id !== idToRemove);
    
    if (idArray.length === 0) {
      localStorage.removeItem('compare_product_ids');
      navigate('/products');
      return;
    }

    localStorage.setItem('compare_product_ids', JSON.stringify(idArray));
    navigate(`/products/compare?ids=${idArray.join(',')}`);
  };

  const renderValue = (value: any) => {
    if (value === null || value === undefined || value === '' || value === '—' || value === 'N/A') {
      return <span className="text-gray-400 italic font-normal">Không có</span>;
    }
    return value;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang đối chiếu cấu hình chi tiết...</p>
        </div>
      </div>
    );
  }

  if (error || !idsParam || products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có sản phẩm so sánh</h3>
          <p className="text-gray-500 text-sm mb-6">
            {error || 'Vui lòng quay lại danh sách sản phẩm và chọn ít nhất một thiết bị để tiến hành so sánh đối chiếu.'}
          </p>
          <Link
            to="/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-all"
          >
            Quay lại trang sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Phần Header Điều Hướng */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link to="/products" className="hover:text-blue-600 transition">Thiết bị</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">So sánh kỹ thuật</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 sm:text-3xl tracking-tight">
              Bảng So Sánh Thiết Bị Chi Tiết
            </h1>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition"
          >
            ← Thêm sản phẩm khác
          </Link>
        </div>

        {/* Khối Bảng So Sánh Dạng Cuộn Ngang (Responsive Table) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {/* Cột tiêu đề trống đầu tiên */}
                  <th className="w-64 p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Thuộc tính đối chiếu
                  </th>
                  {/* Render động các cột tương ứng với sản phẩm gửi lên */}
                  {products.map((product) => {
                    const displayImage = product.thumbnail || 
                      (product.images && product.images[0]?.image_url) || 
                      (Array.isArray(product.images) && product.images[0]) ||
                      "/placeholder.jpg";
                    const formattedPrice = new Intl.NumberFormat('vi-VN').format(Number(product.price_per_day) || 0);

                    return (
                      <th key={product.id} className="min-w-[280px] p-5 relative align-top group border-l border-gray-100/70">
                        {/* Nút xóa nhanh sản phẩm ra khỏi bảng so sánh */}
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="absolute top-4 right-4 w-7 h-7 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 rounded-full flex items-center justify-center transition shadow-sm z-10"
                          title="Xóa khỏi danh sách"
                        >
                          ✕
                        </button>
                        
                        <div className="flex flex-col h-full">
                          {/* Hình ảnh */}
                          <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-50 mb-3 border border-gray-100">
                            <img 
                              src={displayImage} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                            />
                          </div>
                          {/* Tên & Giá thiết bị */}
                          <Link 
                            to={`/products/${product.id}`}
                            className="text-sm font-bold text-gray-900 hover:text-blue-600 transition line-clamp-2 mb-2 pr-4"
                          >
                            {product.name}
                          </Link>
                          <div className="text-blue-600 font-extrabold text-base mt-auto">
                            {formattedPrice}đ <span className="text-xs text-gray-400 font-normal">/ngày</span>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                
                <tr className="bg-gray-50/70">
                  <td colSpan={products.length + 1} className="p-3 font-bold text-blue-900 text-xs uppercase tracking-wider">
                    Thông tin cơ bản
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 bg-gray-50/20">Thương hiệu</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 text-gray-900 font-bold border-l border-gray-50">
                      {renderValue(p.brand)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 bg-gray-50/20">Danh mục</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 text-gray-700 border-l border-gray-50">
                      {renderValue(p.category?.name)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 bg-gray-50/20">Giá đặt cọc</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 text-gray-700 border-l border-gray-50 font-medium">
                      {p.deposit_value ? `${new Intl.NumberFormat('vi-VN').format(p.deposit_value)}đ` : renderValue(null)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 bg-gray-50/20">Đánh giá</td>
                  {products.map(p => {
                    const hasRating = p.rating_avg != null && Number(p.rating_avg) > 0;
                    return (
                      <td key={p.id} className="p-4 text-gray-700 border-l border-gray-50">
                        <div className="flex items-center gap-1">
                          {hasRating ? (
                            <>
                              <span className="text-amber-500">⭐</span>
                              <span className="font-bold">
                                {Number(p.rating_avg).toFixed(1)}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">Chưa có</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 bg-gray-50/20">Khu vực kho bãi</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 text-gray-600 border-l border-gray-50">
                      <div>
                        {p.district ? `${p.district}, ${p.city}` : renderValue('Toàn quốc')}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 bg-gray-50/20">Trạng thái hiện tại</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 border-l border-gray-50">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        p.available !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {p.available !== false ? 'Sẵn sàng thuê' : 'Đang bận'}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="bg-gray-50/70">
                  <td colSpan={products.length + 1} className="p-3 font-bold text-blue-900 text-xs uppercase tracking-wider">
                    Thông số kỹ thuật chi tiết
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 bg-gray-50/20">Tiêu cự (Focal Length)</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 text-gray-800 font-medium border-l border-gray-50">
                      {renderValue(p.specs?.focal_length)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 bg-gray-50/20">Khẩu độ tối đa (Max Aperture)</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 text-gray-800 border-l border-gray-50">
                      {renderValue(p.specs?.max_aperture)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 bg-gray-50/20">Ngàm thiết bị (Mount)</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 text-gray-800 border-l border-gray-50">
                      {renderValue(p.specs?.mount)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 bg-gray-50/20">Định dạng cảm biến (Sensor Format)</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 text-gray-800 border-l border-gray-50 font-medium">
                      {renderValue(p.specs?.sensor_format)}
                    </td>
                  ))}
                </tr>

                <tr className="bg-gray-50/10">
                  <td className="p-5 font-semibold text-gray-400 bg-gray-50/10">Hành động</td>
                  {products.map(p => (
                    <td key={p.id} className="p-5 border-l border-gray-50">
                      <Link
                        to={`/products/${p.id}`}
                        className={`w-full text-center block font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all duration-200 ${
                          p.available !== false
                            ? 'bg-gray-900 hover:bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                        }`}
                      >
                        {p.available !== false ? 'Xem & Đặt thuê' : 'Đang được thuê'}
                      </Link>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}