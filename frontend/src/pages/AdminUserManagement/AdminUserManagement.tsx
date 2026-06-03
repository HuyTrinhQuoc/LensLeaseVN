import React from 'react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { UserFilters } from '../../components/AdminUserManager/UserFilters';
import { KycSidebar } from '../../components/AdminUserManager/KycSidebar';


// Bổ sung các hàm helper dùng chung cho cả table
export const translateRole = (role?: string) => {
  switch (role) {
    case 'ADMIN': return 'Quản trị viên';
    case 'USER': return 'Người dùng';
    case 'LENDER': return 'Chủ thiết bị';
    default: return role || 'Chưa rõ';
  }
};

export const renderStatusBadge = (status?: string | null) => {
  switch (status) {
    case 'APPROVED':
      return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-green-100 text-green-800 border border-green-200 shadow-sm">Đã xác minh</span>;
    case 'REJECTED':
      return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200 shadow-sm">Bị từ chối</span>;
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          Chờ duyệt
        </span>
      );
    default:
      return <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-surface-container-high text-on-surface-variant border border-outline/20">Chưa KYC</span>;
  }
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return 'Chưa cập nhật';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

const AdminUserManagement: React.FC = () => {
  const {
    users, selectedUser, isLoading,
    searchTerm, setSearchTerm,
    roleFilter, setRoleFilter,
    kycFilter, setKycFilter,
    setSelectedUser, closeSidebar, handleKycAction
  } = useAdminUsers();

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'US';

  return (
    <main className="flex-1 flex overflow-hidden w-full relative bg-background min-h-screen">
      <section className="flex-1 flex flex-col bg-surface-container-lowest min-w-0 md:min-w-[600px]">
        
        <UserFilters
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          roleFilter={roleFilter} setRoleFilter={setRoleFilter}
          kycFilter={kycFilter} setKycFilter={setKycFilter}
        />

        <div className="flex-1 overflow-auto scrollbar-hide">
          {isLoading ? (
            <div className="p-8 text-center text-outline font-medium">Đang tải dữ liệu...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface/95 backdrop-blur-md z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Người dùng</th>
                  <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Vai trò</th>
                  <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Trạng thái KYC</th>
                  <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Ngày đăng ký</th>
                  <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr 
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`transition-colors cursor-pointer group hover:bg-surface-muted ${selectedUser?.id === user.id ? 'bg-primary/5' : 'bg-surface-container-lowest'}`}
                  >
                    {/* Cột Tên & Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                          {getInitials(user.full_name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-base font-bold text-on-surface truncate max-w-[200px]">{user.full_name?.replace(' undefined', '') || 'Chưa cập nhật'}</span>
                          <span className="text-sm text-outline font-mono mt-0.5 truncate max-w-[200px]">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Cột Vai trò (Đã dịch) */}
                    <td className="px-6 py-4 text-base font-medium text-on-surface whitespace-nowrap">
                      {translateRole(user.role)}
                    </td>
                    
                    {/* Cột Trạng thái KYC (Đã tô màu) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(user.kyc_status)}
                    </td>

                    {/* Cột Ngày đăng ký */}
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-mono whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </td>

                    {/* Cột Thao tác (Đã khôi phục) */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${selectedUser?.id === user.id ? 'bg-primary text-white shadow-md' : 'hover:bg-surface-container-high text-on-surface-variant'}`}
                          title="Xem hồ sơ"
                        >
                          <span className="material-symbols-outlined text-[20px]" style={selectedUser?.id === user.id ? { fontVariationSettings: "'FILL' 1" } : {}}>visibility</span>
                        </button>
                        <button 
                          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-error/10 hover:text-error text-outline transition-colors" 
                          title="Khóa tài khoản"
                          onClick={(e) => {
                            e.stopPropagation(); // Ngăn sự kiện click hàng để không mở sidebar
                            alert(`Chức năng khóa tài khoản ${user.email} đang phát triển`);
                          }}
                        >
                          <span className="material-symbols-outlined text-[20px]">lock</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {selectedUser && (
        <KycSidebar
          user={selectedUser} 
          onClose={closeSidebar} 
          onApprove={() => handleKycAction(selectedUser.id, 'APPROVED')}
          onReject={() => handleKycAction(selectedUser.id, 'REJECTED')}
        />
      )}
    </main>
  );
};

export default AdminUserManagement;