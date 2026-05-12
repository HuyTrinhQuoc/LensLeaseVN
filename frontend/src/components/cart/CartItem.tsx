import React from 'react';
import type { ICartItem,  CartItemProps} from '../../type/cart.type';
//Hiển thị từng sản phẩm


export default function CartItem({ item, onUpdateDays, onRemove }: CartItemProps) {
  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      {/* Hình ảnh */}
      <div className="w-full sm:w-28 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
        <img 
          src={item.image_url} 
          alt={item.title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thông tin thiết bị */}
      <div className="flex-1 space-y-1">
        <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{item.title}</h3>
        <p className="text-sm text-gray-500">{item.brand}</p>
        <div className="text-blue-600 font-bold">
          {formatPrice(item.price_per_day)}đ <span className="text-xs text-gray-400 font-normal">/ ngày</span>
        </div>
      </div>

      {/* Hành động: Chỉnh số ngày & Xóa */}
      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0">
        {/* Bộ đếm số ngày */}
        <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
          <button 
            onClick={() => onUpdateDays(item.id, item.days - 1)}
            disabled={item.days <= 1}
            className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            -
          </button>
          <span className="w-10 text-center font-semibold text-sm">{item.days} <span className="text-xs font-normal text-gray-500">ngày</span></span>
          <button 
            onClick={() => onUpdateDays(item.id, item.days + 1)}
            className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition-colors"
          >
            +
          </button>
        </div>

        {/* Tổng tiền của item này */}
        <div className="text-right hidden sm:block w-28">
          <p className="font-extrabold text-gray-900">{formatPrice(item.price_per_day * item.days)}đ</p>
        </div>

        {/* Nút xóa */}
        <button 
          onClick={() => onRemove(item.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Xóa khỏi giỏ hàng"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}