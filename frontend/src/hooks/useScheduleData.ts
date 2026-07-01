

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAuthToken } from '../utils/auth';
import { supabase } from '../lib/supabase'; // Đảm bảo import đúng đường dẫn client supabase của bạn

export interface Equipment {
  id: string;
  title: string;
  thumbnail: string | null;
}

export interface ScheduleEvent {
  id: string;
  type: 'BOOKING' | 'BLOCKED';
  start_date: string;
  end_date: string;
  label: string;
  status: string;
}

export const useDeviceSchedule = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // MỚI: State cho Tìm kiếm và Chọn Tháng/Năm
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  // 1. Fetch Danh sách thiết bị
  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/owner/schedule/equipments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEquipments(data);
        if (data.length > 0) setSelectedEqId(data[0].id);
      } catch (error) {
        console.error("Lỗi tải thiết bị:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipments();
  }, []);

  // 2. Fetch Lịch trình (Tách ra dùng useCallback để gọi lại khi có Realtime)
  const fetchEvents = useCallback(async () => {
    if (!selectedEqId) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/owner/schedule/events/${selectedEqId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Lỗi tải lịch trình:", error);
    }
  }, [selectedEqId]);

  // 3. Lắng nghe Realtime & Cập nhật Lịch
  useEffect(() => {
    fetchEvents(); // Gọi lần đầu

    if (!selectedEqId) return;

    // Supabase Realtime: Lắng nghe bảng booking_items và blocked_dates
    const channel = supabase.channel(`schedule_updates_${selectedEqId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_items', filter: `lens_id=eq.${selectedEqId}` }, () => {
        fetchEvents();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_dates', filter: `lens_id=eq.${selectedEqId}` }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedEqId, fetchEvents]);

  // 4. API Khóa lịch
  const blockDates = async (start: string, end: string, reason: string) => {
    const token = getAuthToken();
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/owner/schedule/events/${selectedEqId}/block`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ start_date: start, end_date: end, reason }),
    });
    // Không cần gọi fetchEvents() vì Realtime sẽ tự bắt sự kiện và tải lại!
  };

  // 5. Lọc danh sách thiết bị theo từ khóa
  const filteredEquipments = useMemo(() => {
    return equipments.filter(eq => eq.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [equipments, searchTerm]);
// Thêm hàm này vào trong custom hook của bạn
const unblockDate = async (blockId: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/owner/schedule/events/block/${blockId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Gọi API mở khóa lịch thất bại!");
      }

      // 🔥 THÊM DÒNG NÀY: Chủ động bắt cập nhật lại lịch ngay lập tức
      if (typeof fetchEvents === 'function') {
        await fetchEvents(); 
      }

      console.log("🔓 Đã mở khóa lịch thành công!");
    } catch (error) {
      console.error("Lỗi khi mở khóa lịch:", error);
      alert("Không thể mở khóa lịch, vui lòng thử lại!");
    }
  };
  return { 
    equipments: filteredEquipments, 
    rawEquipmentsLength: equipments.length,
    selectedEqId, 
    setSelectedEqId, 
    events, 
    loading,
    searchTerm, setSearchTerm,
    currentDate, setCurrentDate,
    blockDates,
     unblockDate,
  };
};