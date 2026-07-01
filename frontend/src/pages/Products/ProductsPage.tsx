import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import type { ProductItem } from "../../type/product.type";
import { SupabaseService } from "../../services/supabase.service";
import ProductCard from "../../components/layout/ProductCard";
import Pagination from "../../components/common/Pagination";

interface PaginatedResponse {
  data: ProductItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ================= STATE CHO DỮ LIỆU =================
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // ================= STATE CHO PAGINATION & SORT =================
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [sort, setSort] = useState<string>("popular");
  const [search, setSearch] = useState<string>("");

  // ================= STATE CHO TÍNH NĂNG SO SÁNH =================
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareItems, setCompareItems] = useState<ProductItem[]>([]);

  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearch(q);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    const updateCompareState = () => {
      const ids: string[] = JSON.parse(localStorage.getItem('compare_product_ids') || '[]');
      setCompareIds(ids);
    };

    updateCompareState();
    window.addEventListener('storage', updateCompareState);
    window.addEventListener('compare_changed', updateCompareState);

    return () => {
      window.removeEventListener('storage', updateCompareState);
      window.removeEventListener('compare_changed', updateCompareState);
    };
  }, []);

  useEffect(() => {
    if (compareIds.length === 0) {
      setCompareItems([]);
      return;
    }
    const matchedItems = products.filter(p => compareIds.includes(p.id));
    
    setCompareItems(prev => {
      const updated = [...matchedItems];
      prev.forEach(p => {
        if (!updated.some(u => u.id === p.id) && compareIds.includes(p.id)) {
          updated.push(p);
        }
      });
      return updated;
    });
  }, [compareIds, products]);

  const handleRemoveCompareItem = (idToRemove: string) => {
    const updatedIds = compareIds.filter(id => id !== idToRemove);
    localStorage.setItem('compare_product_ids', JSON.stringify(updatedIds));
    setCompareIds(updatedIds);
    window.dispatchEvent(new Event('compare_changed')); 
  };

  const handleGoToComparePage = () => {
    if (compareIds.length < 2) {
      alert("Vui lòng chọn từ 2 thiết bị trở lên để tiến hành đối chiếu so sánh!");
      return;
    }
    navigate(`/products/compare?ids=${compareIds.join(',')}`);
  };

  // ================= STATE CHO BỘ LỌC (SIDEBAR) =================
  const [filterMinPrice, setFilterMinPrice] = useState<string>("");
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>("");
  const [filterBrand, setFilterBrand] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterRating, setFilterRating] = useState<string>("");
  const [filterCity, setFilterCity] = useState<string>("");

  const [appliedFilters, setAppliedFilters] = useState({
    minPrice: "",
    maxPrice: "",
    brand: "",
    category: "",
    city: "",
  });

  // ================= HÀM FETCH DỮ LIỆU =================
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await SupabaseService.getLensListings({
        page,
        limit: 9,
        sort,
        search: search || undefined,
        minPrice: appliedFilters.minPrice ? parseInt(appliedFilters.minPrice) : undefined,
        maxPrice: appliedFilters.maxPrice ? parseInt(appliedFilters.maxPrice) : undefined,
        brand: appliedFilters.brand || undefined,
        category: appliedFilters.category || undefined,
        city: appliedFilters.city || undefined,
      });
      
      setProducts(result.data || []);
      setTotalPages(result.totalPages || 1);
      setTotalItems(result.total || 0);
    } catch (error) {
      console.error("Lỗi tải dữ liệu từ Supabase:", error);
      setProducts([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, sort, search, appliedFilters]);

  // ================= HANDLERS =================
  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters({
      minPrice: filterMinPrice,
      maxPrice: filterMaxPrice,
      brand: filterBrand,
      category: filterCategory,
      city: filterCity,
    });
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(1);
      setSearch(e.currentTarget.value);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-32 pt-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        
        {/* ================= CỘT TRÁI: SIDEBAR LỌC ================= */}
        <aside className="w-full lg:w-1/4">
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">tune</span>
                BỘ LỌC
              </h2>
              <button 
                onClick={() => {
                  setFilterMinPrice("");
                  setFilterMaxPrice("");
                  setFilterBrand("");
                  setFilterCategory("");
                  setFilterRating("");
                  setFilterCity("");
                  setAppliedFilters({ minPrice: "", maxPrice: "", brand: "", category: "", city: "" });
                }}
                className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="bg-white p-7 rounded-[24px] shadow-sm border border-gray-100 space-y-8">
              {/* Lọc Giá */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Khoảng giá (VNĐ)</h3>
                <div className="space-y-3">
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs group-focus-within:text-blue-600">Từ</span>
                    <input 
                      type="number" 
                      placeholder="0" 
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      value={filterMinPrice}
                      onChange={(e) => setFilterMinPrice(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs group-focus-within:text-blue-600">Đến</span>
                    <input 
                      type="number" 
                      placeholder="5.000.000" 
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      value={filterMaxPrice}
                      onChange={(e) => setFilterMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Lọc Thương hiệu */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Thương hiệu</h3>
                <div className="relative">
                  <select 
                    className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all outline-none appearance-none"
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                  >
                    <option value="">Tất cả thương hiệu</option>
                    <option value="Canon">Canon</option>
                    <option value="Nikon">Nikon</option>
                    <option value="Sony">Sony</option>
                    <option value="Fujifilm">Fujifilm</option>
                    <option value="Tamron">Tamron</option>
                    <option value="Sigma">Sigma</option>
                    <option value="Tokina">Tokina</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Lọc Loại Lens */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Loại Lens</h3>
                <div className="relative">
                  <select 
                    className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all outline-none appearance-none"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="">Tất cả loại</option>
                    <option value="0ded0492-9110-4824-a49e-8bac886782dc">Portrait Lens</option>
                    <option value="25e47b22-9799-430e-8e47-d4c9094775d4">Wide Angle Lens</option>
                    <option value="3f467dbf-ccfb-474f-a36d-7969620ed461">Cinema Lens</option>
                    <option value="6507c621-f626-4305-ac1d-37bbd15b72ed">Travel Lens</option>
                    <option value="981a38d6-4c3b-447b-86fa-92f2e600be3a">Prime Lens</option>
                    <option value="a044b8b4-b638-4b34-b2d1-9a59782e19fa">Macro Lens</option>
                    <option value="b90f7709-22bc-46e7-b6fe-1e25d854661e">Event Lens</option>
                    <option value="f1eace11-f9dd-4797-9a71-b8830506fc6b">Telephoto Lens</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Lọc Đánh giá */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Đánh giá</h3>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⭐</span>
                  <select 
                    className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all outline-none appearance-none"
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                  >
                    <option value="">Tất cả đánh giá</option>
                    <option value="5">5.0 sao</option>
                    <option value="4">4.0+ sao</option>
                    <option value="3">3.0+ sao</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Lọc Vị trí */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Khu vực</h3>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">location_on</span>
                  <select 
                    className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all outline-none appearance-none"
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                  >
                    <option value="">Tất cả thành phố</option>
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              <button 
                onClick={handleApplyFilters}
                className="w-full bg-[#1a3fc7] text-white font-black py-4 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">done_all</span>
                ÁP DỤNG
              </button>
            </div>
          </div>
        </aside>

        {/* ================= CỘT PHẢI: KẾT QUẢ TÌM KIẾM ================= */}
        <main className="w-full lg:w-3/4">
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
              {products.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* ================= PAGINATION ================= */}
          {!loading && totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </main>
      </div>

      {/* ================= COMPONENT: COMPARE BAR  ================= */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Tiêu đề & Đếm số lượng */}
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 text-orange-700 w-10 h-10 rounded-xl flex items-center justify-center font-black">
                {compareIds.length}
              </div>
              <div>
                <h5 className="font-bold text-sm text-gray-900">Thiết bị đang chọn so sánh</h5>
                <p className="text-xs text-gray-400 hidden sm:block">Tối đa 4 thiết bị cùng một lúc</p>
              </div>
            </div>

            {/* Danh sách ảnh thu nhỏ các máy được chọn */}
            <div className="flex items-center gap-4 flex-grow justify-center max-w-2xl overflow-x-auto py-1 scrollbar-hide">
              {compareIds.map((id) => {
                const matchedItem = compareItems.find(item => item.id === id);
                const imgSrc = matchedItem?.thumbnail || "/placeholder.jpg";
                const title = matchedItem?.title || "Thiết bị đang chọn";

                return (
                  <div key={id} className="relative w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0 group">
                    <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                    {/* Nút xóa nhanh khỏi mảng */}
                    <button 
                      onClick={() => handleRemoveCompareItem(id)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold shadow hover:bg-red-600 transition-colors"
                      title="Bỏ chọn"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
              
              {/* Ô trống giả lập nhắc nhở (nếu chọn ít hơn 2) */}
              {compareIds.length < 2 && (
                <div className="text-xs text-orange-600 font-medium bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl animate-pulse">
                  Chọn thêm ít nhất 1 thiết bị nữa để so sánh
                </div>
              )}
            </div>

            {/* Nút Hành Động */}
            <div className="flex items-center gap-3 w-full sm:w-auto flex-shrink-0">
              <button
                onClick={() => {
                  localStorage.setItem('compare_product_ids', '[]');
                  setCompareIds([]);
                  window.dispatchEvent(new Event('compare_changed'));
                }}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-2 transition-colors"
              >
                Xóa hết
              </button>
              
              <button
                onClick={handleGoToComparePage}
                disabled={compareIds.length < 2}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg w-full sm:w-auto justify-center ${
                  compareIds.length >= 2
                    ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-500/20 active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>So sánh</span>
                <span className="material-symbols-outlined text-sm">compare_arrows</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}