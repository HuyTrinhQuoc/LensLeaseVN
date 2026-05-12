import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ProductItem } from "../../type/product.type";

interface PaginatedResponse {
  data: ProductItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ProductsPage() {
  // ================= STATE CHO DỮ LIỆU =================
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // ================= STATE CHO PAGINATION & SORT =================
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [sort, setSort] = useState<string>("popular");
  const [search, setSearch] = useState<string>("");

  // ================= STATE CHO BỘ LỌC (SIDEBAR) =================
  // Sử dụng state tạm thời cho form, chỉ khi bấm "Áp dụng" mới fetch
  const [filterMinPrice, setFilterMinPrice] = useState<string>("");
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>("");
  const [filterMinRating, setFilterMinRating] = useState<boolean>(false);
  const [filterCity, setFilterCity] = useState<string>("");

  // State chính thức được dùng để gọi API
  const [appliedFilters, setAppliedFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minRating: "",
    city: "",
  });

  // ================= HÀM FETCH DỮ LIỆU =================
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      params.append("page", page.toString());
      params.append("limit", "9"); // Hiển thị 9 item mỗi trang
      params.append("sort", sort);
      
      if (search) params.append("search", search);
      if (appliedFilters.minPrice) params.append("minPrice", appliedFilters.minPrice);
      if (appliedFilters.maxPrice) params.append("maxPrice", appliedFilters.maxPrice);
      if (appliedFilters.minRating) params.append("minRating", appliedFilters.minRating);
      if (appliedFilters.city) params.append("city", appliedFilters.city);

      const response = await fetch(`http://localhost:3000/lenses?${params.toString()}`);
      if (!response.ok) throw new Error("Lỗi khi tải dữ liệu");
      
      const resData = await response.json() as PaginatedResponse;
      
      setProducts(resData.data || []);
      setTotalPages(resData.totalPages || 1);
      setTotalItems(resData.total || 0);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API mỗi khi page, sort, search hoặc appliedFilters thay đổi
  useEffect(() => {
    fetchProducts();
  }, [page, sort, search, appliedFilters]);

  // ================= HANDLERS =================
  const handleApplyFilters = () => {
    setPage(1); // Reset về trang 1 khi lọc
    setAppliedFilters({
      minPrice: filterMinPrice,
      maxPrice: filterMaxPrice,
      minRating: filterMinRating ? "5" : "", // Trust score 5+ map với minRating = 5
      city: filterCity,
    });
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(1);
      setSearch(e.currentTarget.value);
    }
  };

  const formatPrice = (price?: number | null): string => {
    return new Intl.NumberFormat('vi-VN').format(price || 0);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        
        {/* ================= CỘT TRÁI: SIDEBAR LỌC (Khoảng 25%) ================= */}
        <aside className="w-full lg:w-1/4 space-y-6">
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold text-lg">
            <span>⚙️</span> Bộ lọc tìm kiếm
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            {/* Lọc Giá */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Giá thuê (VND/Ngày)</h3>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Từ..." 
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={filterMinPrice}
                  onChange={(e) => setFilterMinPrice(e.target.value)}
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="number" 
                  placeholder="Đến..." 
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={filterMaxPrice}
                  onChange={(e) => setFilterMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Lọc Đánh giá */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Đánh giá chủ máy</h3>
              <label className="flex items-center gap-3 mb-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={filterMinRating}
                  onChange={(e) => setFilterMinRating(e.target.checked)}
                />
                <span className="text-sm text-gray-700 font-medium">Trust Score 5+ ⭐</span>
              </label>
            </div>

            {/* Lọc Vị trí */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Vị trí gần nhất</h3>
              <select 
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 text-gray-700 bg-white"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
              >
                <option value="">📍 Toàn thành phố</option>
                <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
            </div>

            {/* Nút Áp dụng */}
            <button 
              onClick={handleApplyFilters}
              className="w-full bg-[#0a46b5] text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors shadow-md shadow-blue-500/20"
            >
              Áp dụng bộ lọc
            </button>
          </div>

          {/* Widget Trợ giúp */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h4 className="font-bold text-gray-900 mb-2">Trợ giúp nhanh?</h4>
            <p className="text-sm text-gray-600 mb-4">Bạn chưa tìm thấy thiết bị ưng ý? Hãy để chuyên gia của chúng tôi giúp bạn.</p>
            <a href="#" className="text-blue-600 text-sm font-bold hover:underline">Nhắn tin ngay &rarr;</a>
          </div>
        </aside>

        {/* ================= CỘT PHẢI: KẾT QUẢ TÌM KIẾM (Khoảng 75%) ================= */}
        <main className="w-full lg:w-3/4">
          
          {/* Header Kết quả */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {search ? `Kết quả cho "${search}"` : "Tất cả thiết bị"}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">Tìm thấy {totalItems} thiết bị khả dụng</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm nhanh..." 
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white w-full md:w-64"
                  onKeyDown={handleSearch}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">Sắp xếp:</span>
                <select 
                  className="border-none bg-transparent text-blue-600 font-bold text-sm focus:outline-none cursor-pointer"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="popular">Phổ biến nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá thấp đến cao</option>
                  <option value="price_desc">Giá cao đến thấp</option>
                  <option value="rating">Đánh giá cao</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lưới Sản phẩm */}
          {loading ? (
            <div className="py-20 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
              Không tìm thấy thiết bị nào phù hợp với bộ lọc của bạn.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((item) => {
                const img = item.thumbnail || (item.images && item.images[0]?.image_url) || "/placeholder.jpg";
                // Random tag theo ảnh thiết kế (Bạn có thể map với category/status thật)
                const isAvailable = item.available;
                
                return (
                  <Link 
                    key={item.id}
                    to={`/products/${item.id}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col"
                  >
                    {/* Ảnh & Badges */}
                    <div className="relative w-full aspect-[4/3] bg-gray-100">
                      <img src={img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      
                      {/* Badge Góc Trái */}
                      <div className={`absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-sm ${isAvailable ? 'bg-blue-600' : 'bg-red-500'}`}>
                        {isAvailable ? "CÓ SẴN NGAY" : "ĐÃ CHO THUÊ"}
                      </div>

                      {/* Nút tim Góc Phải */}
                      <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                        🤍
                      </button>
                    </div>

                    {/* Nội dung Card */}
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        {/* Rating Badge Nhỏ */}
                        {item.rating_avg && (
                          <div className="flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 whitespace-nowrap">
                            <span className="text-orange-500 text-[10px]">⭐</span>
                            <span className="text-[11px] font-bold text-orange-700">{Number(item.rating_avg).toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                       {item.district ? `${item.district}, ${item.city}` : 'Không rõ vị trí'}
                      </div>

                      {/* Footer Card */}
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Giá thuê từ</p>
                          <p className="text-blue-600 font-bold text-base">
                            {formatPrice(item.price_per_day)}đ<span className="text-xs font-normal text-gray-500">/ngày</span>
                          </p>
                        </div>
                        
                        {/* Avatar Chủ máy */}
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-xs overflow-hidden" title={item.owner?.full_name}>
                          👤
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ================= PAGINATION ================= */}
          {!loading && totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                &lsaquo;
              </button>
              
              {/* Render danh sách số trang (Đơn giản hóa) */}
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                // Rút gọn trang nếu quá nhiều (chỉ hiện trang hiện tại, +/- 1 trang, trang đầu, trang cuối)
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${page === pageNum ? 'bg-[#0a46b5] text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === page - 2 || pageNum === page + 2) {
                  return <span key={pageNum} className="text-gray-400">...</span>;
                }
                return null;
              })}

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                &rsaquo;
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}