import { useState, useEffect } from 'react';
import { getAuthToken } from '../utils/auth';

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

  // 1. Fetch danh sách thiết bị
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

  // 2. Fetch lịch của thiết bị đang được chọn
  useEffect(() => {
    if (!selectedEqId) return;
    const fetchEvents = async () => {
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
    };
    fetchEvents();
  }, [selectedEqId]);

  return { equipments, selectedEqId, setSelectedEqId, events, loading };
};