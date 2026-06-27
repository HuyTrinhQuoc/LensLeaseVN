import React, { useState } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { KPICard } from '../../components/AdminDashboard/KPICard';

// Import Chart.js
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export const AdminDashboard: React.FC = () => {
  const { filter, handleFilterChange, data, isLoading } = useDashboardData();
  
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // STATE LOADING: Giao diện Skeleton/Pulse mượt mà hơn
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center w-full animate-pulse">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary mb-4 shadow-sm"></div>
        <p className="text-slate-500 font-medium">Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center w-full">
        <div className="px-8 py-6 bg-red-50 text-red-600 rounded-3xl font-bold text-lg shadow-sm">
          Không thể kết nối đến máy chủ. Vui lòng thử lại sau!
        </div>
      </div>
    );
  }

  // 1. DỮ LIỆU BIỂU ĐỒ CỘT
  let barLabels = data.charts.revenueChart.map(d => d.label);
  let barValues = data.charts.revenueChart.map(d => d.value);

  // Xử lý riêng cho năm (Trải đều 12 tháng)
  if (filter === 'YEAR') {
    barLabels = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
    barValues = barLabels.map(label => {
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
        backgroundColor: '#0056d2', // Màu Primary
        borderRadius: 8, // Bo góc cột mềm mại
        barThickness: 32, // Độ rộng cột vừa phải
      },
    ],
  };

  // 2. DỮ LIỆU BIỂU ĐỒ TRÒN
  const pieChartData = {
    labels: data.charts.categoryChart.map(d => d.label),
    datasets: [
      {
        data: data.charts.categoryChart.map(d => d.value),
        backgroundColor: ['#0056d2', '#60a5fa', '#93c5fd', '#fcd34d', '#f87171'],
        borderWidth: 0, // Bỏ viền múi
        hoverOffset: 4, // Hiệu ứng nổi khi hover
      },
    ],
  };

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* 🌟 HEADER & FILTER (Bỏ border, thêm shadow mềm, bo góc 3xl) */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Theo dõi các chỉ số hoạt động kinh doanh</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Nút lọc nhanh */}
          <div className="flex bg-slate-50/80 p-1.5 rounded-2xl">
            {(['DAY', 'MONTH', 'YEAR', 'CUSTOM'] as const).map(f => (
              <button 
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  filter === f 
                    ? 'bg-white text-primary shadow-[0_2px_10px_rgba(0,0,0,0.06)]' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                }`}
              >
                {f === 'DAY' ? 'Hôm nay' : f === 'MONTH' ? 'Tháng này' : f === 'YEAR' ? 'Năm nay' : 'Tùy chỉnh'}
              </button>
            ))}
          </div>

          {/* Ô chọn ngày Tùy chỉnh */}
          {filter === 'CUSTOM' && (
            <div className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-2xl">
              <input 
                type="date" 
                className="px-4 py-2.5 bg-white rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all cursor-pointer"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-slate-400 font-bold">-</span>
              <input 
                type="date" 
                className="px-4 py-2.5 bg-white rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all cursor-pointer"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
              <button 
                onClick={() => handleFilterChange('CUSTOM', customStart, customEnd)}
                className="ml-1 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-[0_4px_14px_rgba(0,86,210,0.3)] disabled:opacity-50 disabled:shadow-none"
                disabled={!customStart || !customEnd}
              >
                Lọc
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 🌟 KPI CARDS */}
      {/* Lưu ý: Nếu component KPICard của bạn có sẵn border, bạn mở file KPICard.tsx ra và xóa class 'border' đi nhé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard title="TỔNG GMV" value={formatVND(data.metrics.gmv)} icon="account_balance_wallet" />
        <KPICard title="HOA HỒNG THUẦN" value={formatVND(data.metrics.commission)} icon="savings" />
        <KPICard title="ĐƠN ĐANG CHẠY" value={data.metrics.activeRentals} icon="sync_alt" />
        <KPICard title="USER MỚI" value={data.metrics.newUsers} icon="group_add" />
        
        <div className={data.metrics.pendingKyc > 0 ? 'ring-2 ring-red-400 rounded-3xl shadow-[0_0_20px_rgba(248,113,113,0.2)]' : ''}>
          <KPICard title="KYC CHỜ DUYỆT" value={data.metrics.pendingKyc} icon="how_to_reg" />
        </div>
        <KPICard title="SỐ DƯ TẠM GIỮ" value={formatVND(data.metrics.escrowBalance)} icon="lock" />
        <KPICard title="SỐ KHOẢN CỌC" value={data.metrics.escrowCount} icon="receipt_long" />
      </div>

      {/* 🌟 CHARTS (Bỏ border, bo góc 3xl, làm mượt lưới biểu đồ) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         {/* Biểu đồ cột */}
         <div className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-800">Doanh thu nền tảng</h3>
            </div>
            <div className="h-[350px] w-full flex-1">
              <Bar 
                data={barChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { 
                      grid: { display: false }, // Ẩn lưới dọc
                      border: { display: false } // Ẩn viền trục X
                    },
                    y: { 
                      grid: { color: '#f1f5f9' }, // Lưới ngang màu xám siêu nhạt
                      border: { display: false } // Ẩn viền trục Y
                    }
                  }
                }} 
              />
            </div>
         </div>

         {/* Biểu đồ tròn */}
         <div className="xl:col-span-1 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 mb-8">Tỷ lệ danh mục</h3>
            <div className="h-[350px] w-full flex-1 flex justify-center items-center">
              <Pie 
                data={pieChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: 'bottom', 
                      labels: { usePointStyle: true, padding: 25, color: '#64748b', font: { family: 'inherit', weight: 600 } } 
                    } 
                  },
                  layout: { padding: 10 }
                }} 
              />
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;