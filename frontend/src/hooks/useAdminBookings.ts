import { useState, useEffect } from 'react';
import api from '../services/api'; 

export const useAdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/admin/bookings?${params.toString()}`);
      setBookings(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn thuê:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [searchTerm, statusFilter, page]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
      if (selectedBooking?.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
      alert('Có lỗi xảy ra khi cập nhật.');
    }
  };

  return {
    bookings,
    selectedBooking,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    setSelectedBooking,
    handleUpdateStatus,
  };
};