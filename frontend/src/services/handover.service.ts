import api from "./api";


export const handoverService = {
  getReport: async (bookingId: string) => {
    const res = await api.get(`/handover-reports/${bookingId}`);
    return res.data;
  },

  processCheckIn: async (bookingId: string, data: {
    note_checkin?: string;
    images_checkin: string[];
    signature_a: string;
    signature_b: string;
  }) => {
    const res = await api.post(`/handover-reports/${bookingId}/check-in`, data);
    return res.data;
  },

  processCheckOut: async (bookingId: string, data: {
    note_checkout?: string;
    images_checkout: string[];
    is_damaged: boolean;
  }) => {
    const res = await api.put(`/handover-reports/${bookingId}/check-out`, data);
    return res.data;
  }
};