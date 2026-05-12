import { Link } from "react-router-dom";
interface BookingSidebarProps {
  pricePerDay: number;
  available: boolean;
}

export default function BookingSidebar({ pricePerDay, available }: BookingSidebarProps) {
  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);
  
  const rentalDays = 3; 
  const totalRental = pricePerDay * rentalDays;
  const deposit = 5000000; 
  const insuranceFee = 120000;
  const grandTotal = totalRental + deposit + insuranceFee;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
      <div className="flex items-start justify-between border-b border-gray-100 pb-6 mb-6">
        <div>
          <span className="text-3xl font-extrabold text-gray-900">{formatPrice(pricePerDay)}đ</span>
          <span className="text-gray-500 text-sm font-medium"> / ngày</span>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded text-blue-700 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span> Chủ sở hữu Pro
        </div>
      </div>

      <div className="space-y-4 text-sm mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Giá thuê ({rentalDays} ngày)</span>
          <span className="font-medium text-gray-900">{formatPrice(totalRental)}đ</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tiền cọc giữ chỗ (Escrow)</span>
          <span className="font-medium text-gray-900">{formatPrice(deposit)}đ</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Phí bảo hiểm <span className="text-gray-400 cursor-pointer">ⓘ</span></span>
          <span className="font-medium text-gray-900">{formatPrice(insuranceFee)}đ</span>
        </div>
        
        <div className="flex justify-between pt-4 border-t border-gray-100 font-bold">
          <span className="text-base text-gray-900">Tổng cộng</span>
          <span className="text-lg text-blue-600">{formatPrice(grandTotal)}đ</span>
        </div>
      </div>

<Link
  to={`/booking`}
  className={`
    w-full rounded-xl py-3 font-semibold text-center block transition
    ${
      available
        ? "bg-blue-600 hover:bg-blue-700 text-white"
        : "bg-slate-200 text-slate-500 cursor-not-allowed pointer-events-none"
    }
  `}
>
  {available ? "Đặt thuê ngay" : "Thiết bị đang bận"}
</Link>

      <p className="text-center text-xs text-gray-400 mt-4">
        Bạn sẽ không bị trừ tiền cho đến khi chủ thiết bị xác nhận.
      </p>
    </div>
  );
}