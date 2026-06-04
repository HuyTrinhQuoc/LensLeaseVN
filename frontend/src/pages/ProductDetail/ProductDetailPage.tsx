import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductGallery from "../../components/product-detail/ProductGallery";
import BookingSidebar from "../../components/product-detail/BookingSidebar"; 
import ProductSpecs from "../../components/product-detail/ProductSpecs";
import ProductCard from "../../components/layout/ProductCard";
import Pagination from "../../components/common/Pagination";
import { useSupabaseLensById, useSupabaseLens } from "../../hooks/useSupabaseLens";

const RELATED_PER_PAGE = 4;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [relatedPage, setRelatedPage] = useState(1);

  // Fetch chi tiết sản phẩm từ Supabase
  const { product, loading, error } = useSupabaseLensById(id || '');

  // Fetch sản phẩm liên quan
  const related = useSupabaseLens({
    page: relatedPage,
    limit: RELATED_PER_PAGE,
    category: product?.category?.id,
    brand: product?.brand as string | undefined,
  });

  if (!product || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center space-y-4">
          <div className="text-6xl">😔</div>
          <p className="text-red-500 font-medium text-lg">{error.message || "Không tìm thấy thiết bị!"}</p>
          <Link to="/products" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Bố cục chia tỷ lệ 65% (Trái) - 35% (Phải) */}
        {/* Cột phải kéo cao bằng cột trái (lg:items-stretch) để sticky có vùng bám — không bị cuộn mất theo nội dung dài. */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-12 relative">
          
          {/* ================= CỘT TRÁI ================= */}
          <div className="w-full lg:w-[65%] space-y-10">
            {/* Khối 1: Hình ảnh */}
            <ProductGallery images={product.images} thumbnail={product.thumbnail || undefined} />

            {/* Khối 2: Tiêu đề & Thông tin cơ bản */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center text-gray-500 text-sm gap-2">
                <span></span> 
                {product.district && product.city 
                  ? `${product.district}, ${product.city}` 
                  : "Vị trí chưa cập nhật"}
              </div>
            </div>

            {/* Khối 3: Thông số kỹ thuật */}
            <ProductSpecs brand={product.brand || undefined} specs={undefined} />
            
            {/* Khối 4: Mô tả thiết bị */}
            {product.description && (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                 <h3 className="text-xl font-bold text-gray-900 mb-4">Mô tả thiết bị</h3>
                 <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                   {product.description}
                 </p>
              </div>
            )}


                    {/* 4. Khối Đánh Giá Khách Hàng (Dựa theo thiết kế) */}
             <div className="mt-4">
               <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Đánh giá từ khách hàng</h3>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-bold">{product.rating_avg ? Number(product.rating_avg).toFixed(1) : "Chưa có"}</span>
                 <span className="text-gray-500 text-sm">({product.review_count || 0} đánh giá)</span>
               </div>
                             </div>

               <div className="space-y-4">
                 {[1, 2].map((item) => (
                  <div key={item} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl">👤</div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Người dùng ẩn danh {item}</h4>
                        <p className="text-xs text-gray-500">Đã thuê 1 tuần trước</p>
                      </div>
                      <div className="ml-auto text-yellow-400 text-sm">⭐⭐⭐⭐⭐</div>
                    </div>
                    <p className="text-sm text-gray-700">Thiết bị hoạt động hoàn hảo, rất đáng tiền. Chủ máy hỗ trợ nhiệt tình.</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ================= CỘT PHẢI ================= */}
          <div className="w-full shrink-0 lg:flex lg:w-[35%] lg:flex-col lg:min-h-0">
            <div className="lg:sticky lg:top-6 lg:z-20 lg:self-start lg:w-full">
              <BookingSidebar
                lensId={product.id}
                ownerId={product.owner_id}
                pricePerDay={Number(product.price_per_day)}
                available={product.available !== false}
                depositAmount={Number((product as any).required_deposit_amount || 0)}
                marketValue={(product as any).market_value ? Number((product as any).market_value) : undefined}
                lensMeta={{
                  title: product.title,
                  image_url:
                    product.images?.[0]?.image_url || product.thumbnail || undefined,
                  brand: product.brand || undefined,
                  category_name: product.category?.name,
                  owner_name: product.owner?.full_name,
                  owner_rating:
                    product.owner && 'rating_avg' in product.owner
                      ? Number((product.owner as any).rating_avg)
                      : product.rating_avg != null
                      ? Number(product.rating_avg)
                      : undefined,
                  allowed_deposit_types: Array.isArray((product as any).allowed_deposit_types)
                    ? [...(product as any).allowed_deposit_types]
                    : undefined,
                  required_deposit_amount: (product as any).required_deposit_amount != null
                    ? Number((product as any).required_deposit_amount)
                    : undefined,
                }}
              />
            </div>
          </div>

          

        </div>

        {/* ================= SẢN PHẨM LIÊN QUAN ================= */}
        <section className="mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Thiết bị liên quan
              </h2>
              <p className="text-gray-500 mt-2">
                Các thiết bị tương tự bạn có thể quan tâm
                {!related.loading && related.total > 0 && (
                  <span className="ml-2 text-sm text-blue-600 font-medium">
                    ({Math.max(0, related.total - 1)} thiết bị)
                  </span>
                )}
              </p>
            </div>
            <Link
              to="/products"
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-1 group"
            >
              Xem tất cả <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>

          {related.loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: RELATED_PER_PAGE }).map((_, i) => (
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
          ) : related.items.length === 0 ? (
            <div className="py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
              Chưa có thiết bị liên quan nào.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {related.items
                  .filter((item) => item.id !== id)
                  .map((item) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
              </div>

              {/* Phân trang sản phẩm liên quan */}
              <div className="mt-8">
                <Pagination
                  currentPage={related.page}
                  totalPages={related.totalPages}
                  onPageChange={setRelatedPage}
                />
              </div>
            </>
          )}
        </section>

      </div>
    </div>
  );
}