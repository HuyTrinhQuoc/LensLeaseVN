import api from './api';

export type ListingApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AdminListingRow = {
  id: string;
  title: string;
  brand?: string | null;
  thumbnail?: string | null;
  image_url?: string | null;
  price_per_day: number;
  market_value?: number | null;
  approval_status: ListingApprovalStatus;
  available: boolean;
  city?: string | null;
  district?: string | null;
  created_at: string;
  category?: { id: string; name: string } | null;
  owner?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
  };
};

export type ListingStats = {
  pending: number;
  approved: number;
  rejected: number;
};

export const adminListingsService = {
  getStats() {
    return api.get<{ data: ListingStats }>('/admin/listings/stats');
  },

  list(params?: {
    status?: ListingApprovalStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return api.get<{ data: AdminListingRow[]; total: number }>('/admin/listings', {
      params,
    });
  },

  getById(id: string) {
    return api.get<{ data: AdminListingRow }>(`/admin/listings/${id}`);
  },

  approve(id: string) {
    return api.patch(`/admin/listings/${id}/approve`);
  },

  reject(id: string, reason?: string) {
    return api.patch(`/admin/listings/${id}/reject`, { reason });
  },
};
