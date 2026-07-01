import React, { useState } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { KPICard } from '../../components/AdminDashboard/KPICard';

// Import các thành phần của Chart.js
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export const AdminDashboard: React.FC = () => {
  const { filter, handleFilterChange, data, isLoading } = useDashboardData();
  
  // State cục bộ để lưu ngày khi người dùng chọn Tùy chỉnh (CUSTOM)
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  if (isLoading) {
    return (
      <div className="ml-[280px] h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
          <p className="text-secondary font-medium">Đang tải dữ liệu tổng quan...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ml-[280px] p-10 flex justify-center text-error font-bold text-xl">
        Không thể kết nối đến máy chủ. Vui lòng thử lại sau!
      </div>
    );
  }

  // --------------------------------------------------------
  // 1. XỬ LÝ DỮ LIỆU BIỂU ĐỒ CỘT (Đảm bảo đủ 12 tháng nếu chọn YEAR)
  // --------------------------------------------------------
  let barLabels = data.charts.revenueChart.map(d => d.label);
  let barValues = data.charts.revenueChart.map(d => d.value);

  if (filter === 'YEAR') {
    // Tạo sẵn mảng 12 tháng
    barLabels = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
    barValues = barLabels.map(label => {
      // Tìm xem backend có trả về tháng này không, không có thì bằng 0
      const found = data.charts.revenueChart.find(d => d.label === label);
      return found ? found.value : 0;
    });
  }

  const barChartData = {
    labels: barLabels,
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: barValues,
        backgroundColor: '#0056d2', 
        borderRadius: 6, // Bo góc cột cho hiện đại
      },
    ],
  };

  // --------------------------------------------------------
  // 2. CẤU HÌNH BIỂU ĐỒ TRÒN
  // --------------------------------------------------------
  const pieChartData = {
    labels: data.charts.categoryChart.map(d => d.label),
    datasets: [
      {
        data: data.charts.categoryChart.map(d => d.value),
        backgroundColor: ['#0056d2', '#4b90ff', '#93c5fd', '#fde047', '#ef4444', '#10b981'],
        borderWidth: 2,
        borderColor: '#ffffff', // Viền trắng phân tách các múi
      },
    ],
  };

  // Format tiền tệ
  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <main className="bg-[#f8fafc] min-h-screen">
      
      {/* KHU VỰC HEADER & FILTER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi các chỉ số hoạt động kinh doanh</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Nhóm nút chọn nhanh */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['DAY', 'MONTH', 'YEAR', 'CUSTOM'] as const).map(f => (
              <button 
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  filter === f 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f === 'DAY' ? 'Hôm nay' : f === 'MONTH' ? 'Tháng này' : f === 'YEAR' ? 'Năm nay' : 'Tùy chỉnh'}
              </button>
            ))}
          </div>

          {/* Ô chọn ngày Tùy chỉnh (Chỉ hiện khi filter === 'CUSTOM') */}
          {filter === 'CUSTOM' && (
            <div className="flex items-center gap-2 animate-fade-in">
              <input 
                type="date" 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-gray-500">-</span>
              <input 
                type="date" 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
              <button 
                onClick={() => handleFilterChange('CUSTOM', customStart, customEnd)}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                disabled={!customStart || !customEnd}
              >
                Lọc
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* KHỐI 1: CÁC CHỈ SỐ KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KPICard title="TỔNG GMV" value={formatVND(data.metrics.gmv)} icon="account_balance_wallet" />
        <KPICard title="HOA HỒNG THUẦN" value={formatVND(data.metrics.commission)} icon="savings" />
        <KPICard title="ĐƠN ĐANG CHẠY" value={data.metrics.activeRentals} icon="sync_alt" />
        <KPICard title="USER MỚI" value={data.metrics.newUsers} icon="group_add" />
        
        {/* Highlight KYC đỏ nếu có người đang chờ */}
        <div className={data.metrics.pendingKyc > 0 ? 'ring-2 ring-error rounded-xl' : ''}>
          <KPICard title="KYC CHỜ DUYỆT" value={data.metrics.pendingKyc} icon="how_to_reg" />
        </div>
        <KPICard title="SỐ DƯ TẠM GIỮ" value={formatVND(data.metrics.escrowBalance)} icon="lock" />
        <KPICard title="SỐ KHOẢN CỌC" value={data.metrics.escrowCount} icon="receipt_long" />
      </div>

      {/* KHỐI 2: KHU VỰC BIỂU ĐỒ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Biểu đồ Cột */}
         <div className="col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Doanh thu nền tảng</h3>
            </div>
            <div className="h-[320px] w-full">
              <Bar 
                data={barChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } } 
                }} 
              />
            </div>
         </div>

         {/* Biểu đồ Tròn */}
         <div className="col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Tỷ lệ danh mục</h3>
            <div className="h-[320px] w-full flex justify-center items-center">
              <Pie 
                data={pieChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } }
                }} 
              />
            </div>
         </div>
      </div>
    </main>
  );
};

export default AdminDashboard;