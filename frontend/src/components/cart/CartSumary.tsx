import React from 'react';
import type { CartSummaryProps } from '../../type/cart.type';
//hiển thị tổng tiền, phí


export default function CartSummary({ totalRentalFee, totalItems }: CartSummaryProps) {
  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

  // Giả định các chi phí phát sinh (Thực tế backend sẽ tính toán)
  const depositFee = totalItems > 0 ? 5000000 : 0; // Cọc cố định hoặc tính theo % giá trị máy
  const insuranceFee = totalItems > 0 ? 120000 * totalItems : 0; 
  const grandTotal = totalRentalFee + depositFee + insuranceFee;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn thuê</h2>
      
      <div className="space-y-4 text-sm mb-6 pb-6 border-b border-gray-100">
        <div className="flex justify-between text-gray-600">
          <span>Phí thuê ({totalItems} thiết bị)</span>
          <span className="font-medium text-gray-900">{formatPrice(totalRentalFee)}đ</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tiền cọc giữ chỗ (Escrow)</span>
          <span className="font-medium text-gray-900">{formatPrice(depositFee)}đ</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Phí bảo hiểm thiết bị</span>
          <span className="font-medium text-gray-900">{formatPrice(insuranceFee)}đ</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <span className="text-base font-bold text-gray-900">Tổng cộng</span>
        <span className="text-2xl font-extrabold text-[#0a46b5]">{formatPrice(grandTotal)}đ</span>
      </div>

      <button 
        disabled={totalItems === 0}
        className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-md ${
          totalItems > 0 
            ? 'bg-[#0a46b5] hover:bg-blue-800 hover:shadow-lg shadow-blue-500/20' 
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        Tiến hành thanh toán
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        Bạn có thể kiểm tra lại thiết bị trước khi chốt đơn.
      </p>
    </div>
  );
}