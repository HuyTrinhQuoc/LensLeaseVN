import React from 'react';

export const formatCurrency = (amount: number | string) => {
  return Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return 'Chưa cập nhật';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const renderBookingStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Chờ xác nhận</span>;
    case 'CONFIRMED':
      return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Đã xác nhận</span>;
    case 'ACTIVE':
      return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Đang thuê</span>;
    case 'COMPLETED':
      return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-green-100 text-green-800 border border-green-200">Hoàn thành</span>;
    case 'CANCELLED':
    case 'REJECTED':
      return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200">Đã hủy/Từ chối</span>;
    case 'OVERDUE':
      return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Quá hạn</span>;
    default:
      return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">{status}</span>;
  }
};