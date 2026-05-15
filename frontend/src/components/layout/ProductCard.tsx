import { Link } from 'react-router-dom';
import type { ProductItem } from '../../type/product.type'; 

interface ProductCardProps {
  item: ProductItem;
}

export default function ProductCard({ item }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(Number(item.price_per_day) || 0);
  const displayImage = item.thumbnail || (item.images && item.images[0]?.image_url) || "/placeholder.jpg";

  return (
    <Link 
      to={`/products/${item.id}`} 
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full"
    >
      {/* 1. Phần Hình Ảnh */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        <img 
          src={displayImage} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Badge Tình trạng - Góc trên trái */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-sm ${item.available !== false ? 'bg-blue-600' : 'bg-red-500'}`}>
          {item.available !== false ? "CÓ SẴN NGAY" : "ĐÃ CHO THUÊ"}
        </div>
        
        {/* Nút tim Góc Phải */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm">
          🤍
        </button>

        {/* Giá tiền - Góc dưới trái */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">
          {formattedPrice}đ <span className="font-normal text-gray-500 text-xs">/ngày</span>
        </div>
      </div>

      {/* 2. Phần Thông Tin (Body) */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors min-h-[44px]">
            {item.title}
          </h3>
          {/* Rating Badge Nhỏ */}
          <div className="flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 whitespace-nowrap">
            <span className="text-orange-500 text-[10px]">⭐</span>
            <span className="text-[11px] font-bold text-orange-700">
              {item.rating_avg ? Number(item.rating_avg).toFixed(1) : '4.9'}
            </span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mb-4 flex items-center gap-1 min-h-[16px]">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          {item.district ? `${item.district}, ${item.city}` : 'Toàn quốc'}
        </div>

        {/* Footer Card */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            {item.brand || 'Premium Brand'}
          </p>
          
          {/* Avatar Chủ máy */}
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-gray-100 shadow-sm flex items-center justify-center text-xs overflow-hidden" title={item.owner?.full_name}>
            {item.owner?.avatar_url ? (
              <img src={item.owner.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-[10px]">👤</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}