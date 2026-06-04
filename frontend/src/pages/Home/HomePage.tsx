import { useState } from "react";
import ProductCard from "../../components/layout/ProductCard";
import Pagination from "../../components/common/Pagination";
import { useSupabaseLens } from "../../hooks/useSupabaseLens";

const ITEMS_PER_PAGE = 8;

export default function HomePage() {
  // Sản phẩm nổi bật (sắp xếp theo rating)
  const [featuredPage, setFeaturedPage] = useState(1);
  const featured = useSupabaseLens({
    page: featuredPage,
    limit: ITEMS_PER_PAGE,
    sort: 'rating',
  });

  // Sản phẩm góc rộng (theo category)
  const [widesPage, setWidesPage] = useState(1);
  const wides = useSupabaseLens({
    page: widesPage,
    limit: ITEMS_PER_PAGE,
    category: '25e47b22-9799-430e-8e47-d4c9094775d4',
  });

  // Sản phẩm giá rẻ (sắp xếp theo giá)
  const [cheapPage, setCheapPage] = useState(1);
  const cheap = useSupabaseLens({
    page: cheapPage,
    limit: ITEMS_PER_PAGE,
    sort: 'price_asc',
  });

  /** Skeleton loading placeholder */
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="aspect-[4/3] bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-1/3 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  /** Render một section sản phẩm có phân trang */
  const renderSection = (
    title: string,
    subtitle: string,
    section: ReturnType<typeof useSupabaseLens>,
    onPageChange: (page: number) => void
  ) => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 mt-2">
            {subtitle}
            {!section.loading && (
              <span className="ml-2 text-sm text-blue-600 font-medium">
                ({section.total} thiết bị)
              </span>
            )}
          </p>
        </div>
        <button className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-1 group">
          Xem tất cả <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
        </button>
      </div>

      {section.error && (
        <div className="py-6 px-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <p className="font-semibold">Lỗi tải dữ liệu:</p>
          <p className="text-sm mt-1">{section.error.message}</p>
        </div>
      )}

      {section.loading ? (
        renderSkeleton()
      ) : section.items.length === 0 ? (
        <div className="py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          Chưa có thiết bị nào trong danh mục này.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {section.items.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>

          {/* Phân trang */}
          <div className="pt-4">
            <Pagination
              currentPage={section.page}
              totalPages={section.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* ================= HERO SECTION ================= */}
<section
  className="relative text-white overflow-hidden bg-center bg-cover"
  style={{
    backgroundImage:
      "url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=80')",
  }}
>
  {/* Overlay tối để chữ dễ đọc */}
  <div className="absolute inset-0 bg-black/60 z-0"></div>

  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12">

    <div className="w-full lg:w-[55%] flex flex-col items-start gap-6 text-center lg:text-left">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
        Thuê Camera & Lens <br />
        <span className="text-blue-400">Chuyên Nghiệp</span>
      </h1>

      <p className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed mx-auto lg:mx-0">
        Truy cập vào các thiết bị quay phim cao cấp từ các thương hiệu hàng đầu thế giới. 
        Giải pháp hoàn hảo cho các nhà sáng tạo nội dung và nhiếp ảnh gia.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto mx-auto lg:mx-0">
        <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg rounded-full transition-all shadow-lg shadow-blue-500/30">
          Khám phá Thiết bị
        </button>

        <button className="px-8 py-4 bg-transparent border border-white/40 hover:border-white hover:bg-white/10 text-white font-semibold text-lg rounded-full transition-all">
          Xem Thêm
        </button>
      </div>
    </div>



  </div>
</section>

      {/* ================= THIẾT BỊ NỔI BẬT ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Danh sách 1: Nổi bật */}
        {renderSection(
          "Thiết bị Nổi bật",
          "Những camera và lens được yêu thích nhất trên LensLeaseVN",
          featured,
          setFeaturedPage
        )}

        {/* Danh sách 2: Góc rộng */}
        {renderSection(
          "Thiết bị góc rộng",
          "Khám phá không gian rộng lớn với ống kính Ultrawide",
          wides,
          setWidesPage
        )}

        {/* Danh sách 3: Giá rẻ */}
        {renderSection(
          "Thiết bị giá rẻ",
          "Tiết kiệm chi phí tối đa cho dự án của bạn",
          cheap,
          setCheapPage
        )}

      </section>

      {/* ================= VÌ SAO CHỌN CHÚNG TÔI ================= */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Tại sao chọn LensLeaseVN?</h2>
            <p className="text-gray-500 mt-4 text-lg">Chúng tôi mang đến trải nghiệm thuê thiết bị dễ dàng, an toàn và đáng tin cậy nhất.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            
            <div className="bg-slate-50 rounded-3xl p-8 text-center hover:-translate-y-2 transition-transform duration-300 border border-gray-100 shadow-sm hover:shadow-md">
              <div className="w-20 h-20 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Giá Cạnh Tranh</h3>
              <p className="text-gray-600 leading-relaxed">
                Tối ưu hóa ngân sách của bạn với mức giá thuê thiết bị chuyên nghiệp hấp dẫn nhất trên thị trường.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-8 text-center hover:-translate-y-2 transition-transform duration-300 border border-gray-100 shadow-sm hover:shadow-md">
              <div className="w-20 h-20 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">An Toàn & Bảo Hiểm</h3>
              <p className="text-gray-600 leading-relaxed">
                Tất cả thiết bị đều được kiểm tra kỹ lưỡng trước khi giao. Giao dịch minh bạch và được bảo vệ.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-8 text-center hover:-translate-y-2 transition-transform duration-300 border border-gray-100 shadow-sm hover:shadow-md">
              <div className="w-20 h-20 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                📷
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Thiết Bị Mới Nhất</h3>
              <p className="text-gray-600 leading-relaxed">
                Luôn cập nhật những mẫu Camera và Lens thế hệ mới nhất để đáp ứng nhu cầu sáng tạo không giới hạn.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}