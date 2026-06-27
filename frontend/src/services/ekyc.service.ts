import api from './api';

export type EkycStatus = {
  kyc_status: string | null;
  is_verified: boolean;
  has_cccd_images: boolean;
  full_name?: string;
};

export type EkycOcrResult = {
  id: string;
  name?: string;
  dob?: string;
  sex?: string;
  nationality?: string;
  address?: string;
  expiry?: string;
};

export const ekycService = {
  getStatus: async (): Promise<{ data: EkycStatus; message: string }> => {
    const response = await api.get('/ekyc/status');
    return response.data;
  },

  submit: async (
    front: File,
    back: File,
  ): Promise<{
    data: { user: { kyc_status: string }; verified: boolean };
    message: string;
  }> => {
    const form = new FormData();
    form.append('front', front);
    form.append('back', back);

    const response = await api.post('/ekyc/submit', form, {
      timeout: 90000,
      transformRequest: (data, headers) => {
        if (headers && typeof headers === 'object') {
          delete (headers as Record<string, string>)['Content-Type'];
        }
        return data;
      },
    });
    return response.data;
  },
};
