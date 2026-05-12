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
      // Bao bọc card với 'group' để điều khiển hiệu ứng hover cho các thẻ con bên trong
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* 1. Phần Hình Ảnh */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        <img 
          src={displayImage} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Badge Danh mục - Góc trên trái */}
        {item.category?.name && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold text-gray-800 shadow-sm">
            {item.category.name}
          </div>
        )}
        
        {/* Giá tiền - Góc dưới trái */}
        <div className="absolute bottom-3 left-3 bg-blue-600/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">
          {formattedPrice}đ <span className="font-normal text-blue-100 text-xs">/ngày</span>
        </div>
      </div>

      {/* 2. Phần Thông Tin (Body) */}
      <div className="p-5 flex flex-col flex-grow gap-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {item.brand || 'Khác'}
        </p>
        
        <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        
        <p className="text-sm text-gray-500 line-clamp-2">
          {item.description}
        </p>

        {/* Phần Đánh giá - Được đẩy xuống sát đáy (mt-auto) */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-50">
          <span className="text-yellow-400">⭐</span> 
          <span className="font-medium text-gray-900">
            {item.rating_avg ? Number(item.rating_avg).toFixed(1) : '0'}
          </span>
          <span className="text-gray-400">
            ({item.review_count || 0} đánh giá)
          </span>
        </div>
      </div>
    </Link>
  );
}