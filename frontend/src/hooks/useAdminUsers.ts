import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export interface UserDetail {
  id: string;
  full_name: string;
  email: string;
  role: string;
  rating_avg?: number;
  kyc_status: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  created_at: string;
  cccd_front_url?: string | null;
  cccd_back_url?: string | null;
  cccd_number?: string | null;
  has_cccd_images?: boolean;
  address?: string;
  phone?: string;
  status?: 'ACTIVE' | 'LOCKED';
}

export function useAdminUsers() {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // States cho Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');

  // 1. Lấy danh sách users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Thay đổi baseUrl tùy theo cấu hình của bạn
      const queryParams = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(kycFilter && { kyc_status: kycFilter }),
      });
      
      const res = await api.get('/admin/users', { params: Object.fromEntries(queryParams) });
      setUsers(res.data);
    } catch (error) {
      console.error('Lỗi khi fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, roleFilter, kycFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 2. Cập nhật KYC
  const handleKycAction = async (userId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/admin/users/${userId}/kyc`, { status: action });
      
      // Cập nhật lại UI sau khi duyệt
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, kyc_status: action } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, kyc_status: action });
      }
    } catch (error) {
      console.error('Lỗi duyệt KYC:', error);
    }
  };

  // 3. Lấy chi tiết user khi click
  const handleSelectUser = async (user: UserDetail) => {
    try {
      const res = await api.get(`/admin/users/${user.id}`);
      setSelectedUser(res.data);
    } catch (error) {
      console.error('Lỗi lấy chi tiết user:', error);
    }
  };
 const handleLockUser = async (userId: string) => {
  try {
    await api.patch(`/admin/users/${userId}/lock`);

    setUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? { ...u, status: 'LOCKED' }
          : u
      )
    );
  } catch (error) {
    console.error(error);
  }
};
const handleUnlockUser = async (userId: string) => {
  try {
    await api.patch(`/admin/users/${userId}/unlock`);

    setUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? { ...u, status: 'ACTIVE' }
          : u
      )
    );
  } catch (error) {
    console.error(error);
  }
};


  return {
    users,
    selectedUser,
    isLoading,
    searchTerm, setSearchTerm,
    roleFilter, setRoleFilter,
    kycFilter, setKycFilter,
    setSelectedUser: handleSelectUser,
    closeSidebar: () => setSelectedUser(null),
    handleKycAction,
    handleLockUser,
    handleUnlockUser
  };
}