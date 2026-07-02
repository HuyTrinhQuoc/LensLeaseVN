// components/NotificationDropdown.tsx
import React, { useState } from 'react';
import  type{ Notification } from '../../hooks/useNotifications';
import  { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { Bell, Check, Info, Calendar, MessageSquare, Tag } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Cấu hình plugin cho dayjs để hiển thị "X phút trước"
dayjs.extend(relativeTime);

export const NotificationDropdown: React.FC = () => {
  // LƯU Ý: Ở đây bạn cần lấy userId của người dùng đang đăng nhập.

const user = useSelector((state: RootState) => state.auth.user);
console.log(user);
  
  // Lấy id từ object user (sử dụng optional chaining '?.' để tránh lỗi nếu user là null)
  const userId = user?.id ?? null;

  // Truyền userId vào custom hook mới
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);

  
  
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const handleNotificationClick = async (notification: Notification) => {
  // Đánh dấu đã đọc nếu chưa đọc
  if (!notification.is_read) {
    await markAsRead(notification.id);
  }

  // Đóng dropdown
  setIsOpen(false);

  // Điều hướng theo loại thông báo
  switch (notification.type) {
    case 'BOOKING':
      if (notification.reference_id) {
        navigate(`/bookings/${notification.reference_id}`);
      }
      break;

    case 'MESSAGE':
      if (notification.reference_id) {
        navigate(`/messages/${notification.reference_id}`);
      }
      break;

    case 'PROMOTION':
      if (notification.reference_id) {
        navigate(`/promotions/${notification.reference_id}`);
      }
      break;

    case 'SYSTEM':
      navigate('/profile');
      break;

    default:
      break;
  }
};

  // Hàm chọn icon dựa theo loại thông báo
  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'MESSAGE': return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'PROMOTION': return <Tag className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />; // SYSTEM
    }
  };

  


















  // Tránh render nếu chưa có userId (chưa đăng nhập)
  if (!userId) return null;

  return (
    <div className="relative">
      {/* Nút Chuông Thông báo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2  focus:outline-none transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 w-80 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl sm:w-96 overflow-hidden">
          {/* Header của Dropdown */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-800">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
              >
                <Check className="w-4 h-4" /> Đọc tất cả
              </button>
            )}
          </div>

          {/* Danh sách thông báo */}
          <div className="overflow-y-auto max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 text-gray-200 mb-2" />
                <p>Bạn chưa có thông báo nào.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex gap-3 p-4 border-b last:border-b-0 cursor-pointer transition-colors ${
                    !notification.is_read 
                      ? 'bg-blue-50 hover:bg-blue-100/80' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  
                  {/* Nội dung */}
                  <div className="flex-1 pr-4">
                    <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-snug">
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                      {dayjs(notification.created_at).fromNow()}
                    </p>
                  </div>

                  {/* Chấm xanh báo chưa đọc */}
                  {!notification.is_read && (
                    <div className="flex-shrink-0 w-2.5 h-2.5 mt-2 bg-blue-600 rounded-full shadow-sm"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};