import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useSelector } from 'react-redux'; // <--- Thêm import này
import type{ RootState } from '../../store/store'; // <--- Thêm type này

export const NotificationDropdown: React.FC = () => {
  // Lấy user trực tiếp từ Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Lấy ra ID và Role
  const userId = user?.id;
  const userRole = user?.role; 

  // Truyền linh hoạt vào hook Socket
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    handleAction 
  } = useNotifications(userId??'', userRole??'');

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  // Click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper render UI cho từng loại thông báo
  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'DISPUTE':
        return { icon: 'gavel', colorClass: 'text-red-500 bg-red-100', actionText: 'Xử lý ngay' };
      case 'KYC_REQUEST':
        return { icon: 'id_card', colorClass: 'text-amber-500 bg-amber-100', actionText: 'Duyệt giấy tờ' };
      case 'PAYOUT_REQUEST':
        return { icon: 'payments', colorClass: 'text-green-500 bg-green-100', actionText: 'Kiểm tra' };
      case 'BOOKING':
        return { icon: 'book_online', colorClass: 'text-blue-500 bg-blue-100', actionText: 'Xem đơn' };
      default:
        return { icon: 'info', colorClass: 'text-primary bg-primary/10', actionText: 'Xem chi tiết' };
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    // Hàm rút gọn thời gian (bạn có thể dùng dayjs/date-fns)
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-surface-container-high transition-colors"
      >
        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center border-2 border-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Box Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-surface-container-lowest border border-outline/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-outline/10 flex justify-between items-center bg-surface">
            <h3 className="font-bold text-on-surface text-base">Thông báo</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs font-semibold text-primary hover:underline">
                Đánh dấu đã đọc hết
              </button>
            )}
          </div>

          {/* List Thông báo */}
          <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-outline text-sm">
                Không có thông báo mới nào.
              </div>
            ) : (
              notifications.map((noti) => {
                const style = getNotificationStyles(noti.type);
                return (
                  <div 
                    key={noti.id} 
                    className={`p-3 rounded-xl transition-colors ${noti.is_read ? 'opacity-70 hover:bg-surface-container' : 'bg-surface hover:bg-surface-container-high border-l-4 border-primary'}`}
                  >
                    <div className="flex gap-3 items-start">
                      {/* Icon */}
                      <div className={`p-2 rounded-full flex-shrink-0 ${style.colorClass}`}>
                        <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
                      </div>
                      
                      {/* Nội dung */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm text-on-surface truncate pr-2">{noti.title}</h4>
                          <span className="text-[10px] text-outline flex-shrink-0 whitespace-nowrap">
                            {formatTimeAgo(noti.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">
                          {noti.content}
                        </p>
                        
                        {/* Nhóm Action Buttons */}
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => { setIsOpen(false); handleAction(noti); }}
                            className="px-3 py-1.5 bg-primary text-on-primary text-[11px] font-bold rounded-lg hover:bg-primary/90 transition"
                          >
                            {style.actionText}
                          </button>
                          
                          {!noti.is_read && (
                            <button 
                              onClick={() => markAsRead(noti.id)}
                              className="px-3 py-1.5 bg-surface-container text-on-surface-variant text-[11px] font-bold rounded-lg hover:bg-surface-container-highest transition"
                            >
                              Bỏ qua
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};