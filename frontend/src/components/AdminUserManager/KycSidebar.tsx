import React from 'react';
import type { UserDetail } from '../../hooks/useAdminUsers';

interface Props {
  user: UserDetail;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export const KycSidebar: React.FC<Props> = ({ user, onClose, onApprove, onReject }) => {
  // Lấy 2 chữ cái đầu của tên
  const getInitials = (name?: string) => name ? name.substring(0, 2).toUpperCase() : 'US';

  // Dịch vai trò sang tiếng Việt
  const translateRole = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'USER': return 'Người dùng';
      case 'LENDER': return 'Chủ thiết bị'; // Thêm nếu hệ thống của bạn có role này
      default: return role || 'Chưa rõ';
    }
  };

  // Format ngày tháng (VD: 24/10/2023)
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Trả về Badge màu mè cho trạng thái KYC
  const renderStatusBadge = (status?: string | null) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-green-100 text-green-800 border border-green-200 shadow-sm">Đã xác minh</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200 shadow-sm">Bị từ chối</span>;
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Chờ duyệt</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-surface-container-high text-on-surface-variant border border-outline/20">Chưa KYC</span>;
    }
  };

  return (
   <aside className="fixed top-0 right-0 h-screen w-[400px] lg:w-[480px] bg-surface flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.08)] z-[100] transition-transform bg-white">
      <div className="px-8 py-6 flex justify-between items-center bg-surface-container-lowest">
        <h3 className="text-xl font-extrabold text-on-surface">Chi tiết hồ sơ KYC</h3>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8 flex flex-col gap-8">
        
        {/* User Info Summary */}
        <div className="flex items-start gap-5 p-5 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-extrabold shrink-0 shadow-md">
            {getInitials(user.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            {/* Tên & Status Badge */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h4 className="text-lg font-extrabold text-on-surface truncate">
                {user.full_name || 'Chưa cập nhật'}
              </h4>
              {renderStatusBadge(user.kyc_status)}
            </div>
            
            {/* Vai trò */}
            <p className="text-sm text-on-surface-variant mb-1">
              Vai trò: <span className="font-bold text-primary">{translateRole(user.role)}</span>
            </p>
            
            {/* Email & Ngày đăng ký */}
            <div className="mt-2 flex flex-col gap-1.5">
              <p className="text-sm font-mono text-outline bg-surface-container-high px-2 py-0.5 rounded w-fit truncate max-w-full">
                {user.email}
              </p>
              {user.cccd_number && (
                <p className="text-sm text-on-surface-variant">
                  Số CCCD:{' '}
                  <span className="font-mono font-semibold text-on-surface">{user.cccd_number}</span>
                </p>
              )}
              <p className="text-sm text-on-surface-variant flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
                Đăng ký: <span className="font-medium text-on-surface">{formatDate(user.created_at)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* View Ảnh CCCD (signed URL từ S3 — hết hạn sau ~10 phút) */}
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <h5 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">CCCD Mặt trước</h5>
            <div className="w-full aspect-[1.6/1] bg-surface-container-high rounded-2xl overflow-hidden relative shadow-sm border border-outline/10">
               {user.cccd_front_url ? (
                 <img src={user.cccd_front_url} alt="CCCD Front" className="w-full h-full object-cover" />
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-outline opacity-60">
                    <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                    <p className="text-sm font-medium">Chưa cập nhật ảnh</p>
                 </div>
               )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h5 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">CCCD Mặt sau</h5>
            <div className="w-full aspect-[1.6/1] bg-surface-container-high rounded-2xl overflow-hidden relative shadow-sm border border-outline/10">
               {user.cccd_back_url ? (
                 <img src={user.cccd_back_url} alt="CCCD Back" className="w-full h-full object-cover" />
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-outline opacity-60">
                    <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                    <p className="text-sm font-medium">Chưa cập nhật ảnh</p>
                 </div>
               )}
            </div>
          </div>
          {user.has_cccd_images && (
            <p className="text-xs text-on-surface-variant">
              Ảnh được tải qua liên kết bảo mật tạm thời (S3 private). Làm mới trang nếu ảnh hết hạn.
            </p>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-8 bg-surface-container-lowest flex flex-col gap-4 shrink-0 border-t border-surface-container shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        {user.kyc_status === 'PENDING' ? (
          <>
            <button onClick={onApprove} className="w-full py-4 bg-primary text-white text-base font-extrabold rounded-xl hover:bg-primary/90 hover:shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
              Phê duyệt KYC
            </button>
            <button onClick={onReject} className="w-full py-3.5 border-2 border-error text-error text-base font-bold rounded-xl hover:bg-error/5 transition-colors active:scale-[0.98]">
              Từ chối
            </button>
          </>
        ) : (
          <div className={`w-full py-4 text-base font-extrabold rounded-xl flex items-center justify-center gap-2 border-2 ${
            user.kyc_status === 'APPROVED' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
             <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {user.kyc_status === 'APPROVED' ? 'verified' : 'cancel'}
             </span>
             {user.kyc_status === 'APPROVED' ? 'Tài khoản đã xác minh' : 'Tài khoản bị từ chối KYC'}
          </div>
        )}
      </div>
    </aside>
  );
};