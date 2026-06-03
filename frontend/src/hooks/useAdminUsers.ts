// hooks/useAdminUsers.ts
import { useState, useEffect, useCallback } from 'react';

export interface UserDetail {
  id: string;
  full_name: string;
  email: string;
  role: string;
  kyc_status: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  created_at: string;
  cccd_front?: string;
  cccd_back?: string;
  address?: string;
  phone?: string;
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
      
      const res = await fetch(`http://localhost:3000/admin/users?${queryParams}`);
      const data = await res.json();
      setUsers(data);
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
      await fetch(`http://localhost:3000/admin/users/${userId}/kyc`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });
      
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
      const res = await fetch(`http://localhost:3000/admin/users/${user.id}`);
      const detail = await res.json();
      setSelectedUser(detail);
    } catch (error) {
      console.error('Lỗi lấy chi tiết user:', error);
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
  };
}