import React from 'react';

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  roleFilter: string;
  setRoleFilter: (v: string) => void;
  kycFilter: string;
  setKycFilter: (v: string) => void;
}

export const UserFilters: React.FC<Props> = ({ searchTerm, setSearchTerm, roleFilter, setRoleFilter, kycFilter, setKycFilter }) => {
  return (
    <div className="px-6 py-6 flex flex-col gap-5">
      <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">Quản lý người dùng</h2>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[320px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[22px]">search</span>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm tên, email..." 
            className="w-full pl-12 pr-4 py-3 bg-surface rounded-xl text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-4 py-3 bg-surface rounded-xl text-base focus:border-primary outline-none cursor-pointer shadow-sm">
          <option value="">Tất cả vai trò</option>
          <option value="USER">Người thuê</option>
          <option value="OWNER">Chủ cho thuê</option>
          <option value="ADMIN">Quản trị viên</option>
        </select>
        <select value={kycFilter} onChange={e => setKycFilter(e.target.value)} className="px-4 py-3 bg-surface rounded-xl text-base focus:border-primary outline-none cursor-pointer shadow-sm">
          <option value="">Tất cả trạng thái KYC</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã xác minh</option>
          <option value="REJECTED">Bị từ chối</option>
        </select>
      </div>
    </div>
  );
};