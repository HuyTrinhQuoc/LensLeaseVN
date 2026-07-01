import React from 'react';
import { formatCurrency, formatDate, renderBookingStatusBadge } from '../../utils/bookingUtils';

interface Props {
  booking: any;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export const BookingDetailSidebar: React.FC<Props> = ({ booking, onClose, onUpdateStatus }) => {
  return (
   <aside className="fixed right-0 top-0 h-screen w-full md:w-[400px] lg:w-[400px] border-l border-outline/10 bg-surface-container-lowest flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.08)] z-50 overflow-y-auto">
      <div className="sticky top-0 bg-surface-container-lowest z-10 px-6 py-5 flex items-center justify-between border-b border-outline/10">
        <h2 className="text-xl font-bold text-on-surface">Chi tiết đơn thuê</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div>
          <p className="text-sm text-outline mb-1">Mã đơn thuê</p>
          <p className="font-mono font-bold text-sm bg-surface-container-highest p-2 rounded-lg break-all">{booking.id}</p>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold">Trạng thái hiện tại:</span>
          {renderBookingStatusBadge(booking.status)}
        </div>

        <div className="grid grid-cols-2 gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
          <div>
            <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Người thuê (Renter)</p>
            <p className="font-semibold text-sm">{booking.user?.full_name || 'Chưa cập nhật'}</p>
            <p className="text-xs text-outline break-all">{booking.user?.email}</p>
            <p className="text-xs text-outline">{booking.user?.phone}</p>
          </div>
          <div>
            <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Chủ thiết bị (Owner)</p>
            <p className="font-semibold text-sm">{booking.owner?.full_name || 'Chưa cập nhật'}</p>
            <p className="text-xs text-outline break-all">{booking.owner?.email}</p>
            <p className="text-xs text-outline">{booking.owner?.phone}</p>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold mb-3">Thời gian thuê</h3>
          <div className="flex justify-between text-sm">
            <span>Từ: {formatDate(booking.start_date)}</span>
            <span>Đến: {formatDate(booking.end_date)}</span>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold mb-3">Thiết bị ({booking.items?.length})</h3>
          <div className="flex flex-col gap-3">
            {booking.items?.map((item: any) => (
              <div key={item.id} className="flex gap-3 border border-outline/20 p-3 rounded-lg bg-surface">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.lens?.title}</p>
                  <p className="text-xs text-outline mt-1">
                    {formatCurrency(item.price_per_day)} x {item.quantity} máy
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-high p-4 rounded-xl">
          <div className="flex justify-between mb-2 text-sm">
            <span>Tạm tính</span>
            <span>{formatCurrency(booking.sub_total)}</span>
          </div>
          <div className="flex justify-between mb-2 text-sm text-green-600">
            <span>Giảm giá</span>
            <span>- {formatCurrency(booking.discount_amount)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-outline/20 font-bold text-lg text-primary">
            <span>Tổng cộng</span>
            <span>{formatCurrency(booking.total_price)}</span>
          </div>
        </div>

        {/* Action cho Admin can thiệp nếu cần */}
        <div className="mt-4 pt-4 border-t border-outline/10">
          <p className="text-sm font-bold text-red-600 mb-2">Công cụ Quản trị viên (Can thiệp)</p>
          <select 
            className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-surface mb-2 outline-none text-sm"
            onChange={(e) => {
              if (window.confirm('Bạn có chắc muốn ép đổi trạng thái đơn này?')) {
                onUpdateStatus(booking.id, e.target.value);
              }
            }}
            value={booking.status}
          >
            <option value="PENDING">Chuyển về: PENDING</option>
            <option value="CANCELLED">Hủy đơn: CANCELLED</option>
            <option value="COMPLETED">Hoàn thành: COMPLETED</option>
          </select>
        </div>
      </div>
    </aside>
  );
};