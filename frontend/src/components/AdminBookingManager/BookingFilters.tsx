import React from 'react';

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
}

export const BookingFilters: React.FC<Props> = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
  return (
    <div>
    <h1 className="ml-6 mt-5 text-2xl font-extrabold text-slate-800 tracking-tight">Quản lí đơn thuê</h1>
    <div className="p-6 border-b border-outline/10  flex flex-col md:flex-row gap-4 items-center">
    
      <div className="relative w-full md:w-96">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        <input
          type="text"
          placeholder="Tìm theo ID, Email người thuê/chủ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline/20 bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>
      <div className="w-full md:w-48">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="ACTIVE">Đang thuê</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>
    </div>
    </div>
  );
};