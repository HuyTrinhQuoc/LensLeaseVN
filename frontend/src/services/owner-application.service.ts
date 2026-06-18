import api from './api';

export type OwnerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type OwnerApplication = {
  id: string;
  user_id: string;
  phone: string;
  area: string;
  equipment_types: string;
  description?: string | null;
  status: OwnerApplicationStatus;
  admin_note?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  user?: {
    id: string;
    full_name?: string | null;
    email: string;
    phone?: string | null;
    role: string;
    kyc_status?: string | null;
    created_at: string;
  };
};

export const ownerApplicationService = {
  getMine() {
    return api.get<{ message: string; data: OwnerApplication | null }>('/owner-applications/me');
  },

  submit(body: {
    phone: string;
    area: string;
    equipment_types: string;
    description?: string;
  }) {
    return api.post<{ message: string; data: OwnerApplication }>('/owner-applications', body);
  },

  listAdmin(status?: string) {
    return api.get<{ message: string; data: OwnerApplication[] }>('/admin/owner-applications', {
      params: status ? { status } : undefined,
    });
  },

  approve(id: string, admin_note?: string) {
    return api.patch(`/admin/owner-applications/${id}/approve`, { admin_note });
  },

  reject(id: string, admin_note?: string) {
    return api.patch(`/admin/owner-applications/${id}/reject`, { admin_note });
  },
};
