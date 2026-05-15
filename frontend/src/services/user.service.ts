import api from './api';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: string;
  status: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  rating_avg?: number;
  kyc_status?: string;
}

export const userService = {
  getMe: async (): Promise<{ data: UserProfile; message: string }> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<{ data: UserProfile; message: string }> => {
    const response = await api.patch('/users/me', data);
    return response.data;
  },

  getUserById: async (id: string): Promise<{ data: UserProfile; message: string }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};
