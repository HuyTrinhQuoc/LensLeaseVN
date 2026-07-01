import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import api from '../services/api'; // Axios instance của bạn
import type { AppNotification } from '../type/notification';

// Sửa dòng này: thêm tham số userRole
export const useNotifications = (userId: string, userRole: string) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();

  // 1. Fetch thông báo từ API khi khởi tạo
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/admin/notifications?is_read=false');
        setNotifications(res.data.data);
      } catch (error) {
        console.error('Lỗi khi lấy thông báo:', error);
      }
    };
    if (userId) fetchNotifications();
  }, [userId]);

  // 2. Thiết lập kết nối Socket.io
  useEffect(() => {
    if (!userId) return;

    const newSocket = io('http://localhost:3000', {
      query: { userId, role: userRole }, // Bây giờ userRole đã tồn tại
    });

    if (userRole === 'ADMIN') {
      newSocket.on('new_admin_notification', (newNoti) => {
        setNotifications((prev) => [newNoti, ...prev]);
      });
    } else {
      newSocket.on('new_user_notification', (newNoti) => {
        setNotifications((prev) => [newNoti, ...prev]);
      });
    }

    setSocket(newSocket);
    return () => { newSocket.close(); };
  }, [userId, userRole]); 

  // ... (giữ nguyên các phần code bên dưới của bạn)

  // 3. Hàm đánh dấu đã đọc
  const markAsRead = async (notiId: string) => {
    try {
      await api.patch(`/admin/notifications/${notiId}/read`);
      setNotifications((prev) => prev.filter((n) => n.id !== notiId));
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post(`/admin/notifications/read-all`);
      setNotifications([]);
    } catch (error) {
      console.error('Lỗi đánh dấu tất cả:', error);
    }
  };

  // 4. ACTION (Quan trọng nhất): Điều hướng & Xử lý dựa trên Loại thông báo
  const handleAction = async (noti: AppNotification) => {
    // Tự động đánh dấu đã đọc khi click
    if (!noti.is_read) {
      markAsRead(noti.id);
    }

    if (!noti.reference_id) return;

    switch (noti.type) {
      case 'KYC_REQUEST':
        // Chuyển đến trang User Management và mở popup duyệt user đó
        navigate(`/admin/users?highlight_id=${noti.reference_id}&action=review_kyc`);
        break;
      case 'DISPUTE':
        // Chuyển đến trang Tranh chấp
        navigate(`/admin/disputes/${noti.reference_id}`);
        break;
      case 'PAYOUT_REQUEST':
        // Chuyển đến trang Tài chính/Rút tiền
        navigate(`/admin/finance?payout_id=${noti.reference_id}`);
        break;
      case 'BOOKING':
        navigate(`/admin/bookings?highlight_id=${noti.reference_id}`);
        break;
      default:
        console.log('Không có action cụ thể cho type này');
    }
  };

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.is_read).length,
    markAsRead,
    markAllAsRead,
    handleAction
  };
};