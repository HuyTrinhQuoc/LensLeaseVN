import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  type: 'SYSTEM' | 'BOOKING' | 'MESSAGE' | 'PROMOTION';
  reference_id: string | null;
}

// Truyền userId (có thể lấy từ Auth Context/Redux) vào hook này
export const useNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Hàm gọi API lấy lịch sử thông báo lúc mới load trang
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      console.log(response.data);
      const data = response.data;
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Thiết lập Supabase Realtime
  useEffect(() => {
    fetchNotifications();

    if (!userId) return;

    // Đăng ký kênh lắng nghe sự kiện
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Chỉ quan tâm khi có thông báo mới được tạo
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`, // Bắt buộc: Chỉ nghe thông báo thuộc về user này
        },
        (payload) => {
          // Khi có thông báo mới, payload.new sẽ chứa dữ liệu của dòng vừa insert
          const newNotification = payload.new as Notification;
          
          // Thêm thông báo mới vào đầu danh sách và tăng số đếm chưa đọc
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Tùy chọn: Chạy âm thanh ting ting hoặc bật Toast/Snackbar ở đây
        }
      )
      .subscribe();

    // Dọn dẹp (Cleanup) khi component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Lỗi khi đánh dấu đọc tất cả:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  };
};