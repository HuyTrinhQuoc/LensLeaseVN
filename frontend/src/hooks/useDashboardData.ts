import { useState, useEffect } from 'react';


// 🔴 QUAN TRỌNG: Import file api.ts của bạn vào đây
// Đổi lại đường dẫn tương đối cho đúng với project của bạn (vd: '../../utils/api')
import api from '../services/api'
import type { DashboardResponse, DateFilter } from '../type/AdminDashboard';

export const useDashboardData = () => {
  const [filter, setFilter] = useState<DateFilter>('YEAR'); 
  const [customRange, setCustomRange] = useState<{ startDate?: string; endDate?: string }>({});
  
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleFilterChange = (newFilter: DateFilter, start?: string, end?: string) => {
    setFilter(newFilter);
    if (newFilter === 'CUSTOM' && start && end) {
      setCustomRange({ startDate: start, endDate: end });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const backendType = filter.toLowerCase();
        
        // Setup Params cho Axios để tự động nối vào URL (?type=...&startDate=...)
        const params: Record<string, string> = { type: backendType };
        
        if (filter === 'CUSTOM' && customRange.startDate && customRange.endDate) {
          params.startDate = customRange.startDate;
          params.endDate = customRange.endDate;
        }

        // Dùng Axios gọi API thay vì fetch
        // Lưu ý: Không cần /api ở đầu nữa vì baseURL của bạn đã là http://localhost:3000
        const response = await api.get<DashboardResponse>('/admin-dashboard/metrics', {
          params: params
        });

        // Axios tự động parse JSON nên chỉ cần gọi response.data
        setData(response.data);
        
      } catch (error: any) {
        console.error("Lỗi fetch API Dashboard:", error);
        
        // Log thêm chi tiết lỗi từ backend (nếu có) để dễ debug
        if (error.response) {
            console.error("Chi tiết lỗi từ NestJS:", error.response.data);
        }
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filter, customRange]);

  return { filter, handleFilterChange, data, isLoading };
};