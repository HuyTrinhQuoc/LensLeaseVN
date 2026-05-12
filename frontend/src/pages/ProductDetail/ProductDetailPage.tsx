import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductGallery from "../../components/product-detail/ProductGallery";
import BookingSidebar from "../../components/product-detail/BookingSidebar"; 
import ProductSpecs from "../../components/product-detail/ProductSpecs";
import { ProductService } from "../../services/product.service";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await ProductService.getProductById(id);
        setProduct(data);
      } catch (err: any) {
        const errorMessage = 
          err.response?.data?.message || 
          err.message || 
          "Có lỗi xảy ra khi tải dữ liệu";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Đang tải dữ liệu...</div>;
  if (error || !product) return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">{error || "Không tìm thấy thiết bị!"}</div>;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Bố cục chia tỷ lệ 65% (Trái) - 35% (Phải) */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          
          {/* ================= CỘT TRÁI ================= */}
          <div className="w-full lg:w-[65%] space-y-10">
            {/* Khối 1: Hình ảnh */}
            <ProductGallery images={product.images} thumbnail={product.thumbnail} />

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
            <ProductSpecs brand={product.brand} specs={product.specs} />
            
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

               {/* Dữ liệu giả lập cho phần review giống UI, bạn có thể map dữ liệu thật sau */}
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
          <div className="w-full lg:w-[35%]">
            <BookingSidebar 
              pricePerDay={Number(product.price_per_day)} 
              available={product.available} 
            />
            
          </div>

          

        </div>
      </div>
    </div>
  );
}