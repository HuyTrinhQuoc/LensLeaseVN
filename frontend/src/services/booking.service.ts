import axios from 'axios';
import api from './api';

export type BookingRole = 'renter' | 'owner';

export interface CreateBookingBody {
  lens_id: string;
  start_date: string;
  end_date: string;
  quantity?: number;
  selected_deposit_type: string;
  delivery_method?: string;
  delivery_address?: string;
  deposit_note?: string;
}

export const bookingService = {
  getCalendar(lensId: string, month: string, opts?: { signal?: AbortSignal }) {
    return api.get(`/bookings/lenses/${lensId}/calendar`, {
      params: { month },
      ...(opts?.signal ? { signal: opts.signal } : {}),
    });
  },

  checkAvailability(
    lensId: string,
    params: { start_date: string; end_date: string; quantity?: number },
    opts?: { signal?: AbortSignal },
  ) {
    return api.get(`/bookings/lenses/${lensId}/check-availability`, {
      params: {
        start_date: params.start_date,
        end_date: params.end_date,
        quantity: params.quantity ?? 1,
      },
      ...(opts?.signal ? { signal: opts.signal } : {}),
    });
  },

  create(body: CreateBookingBody) {
    return api.post('/bookings', body);
  },

  checkoutGroup(body: { items: CreateBookingBody[]; cart_item_ids?: string[] }) {
    return api.post('/bookings/checkout-group', body);
  },

  list(params: {
    role: BookingRole;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return api.get('/bookings', { params });
  },

  getById(id: string) {
    return api.get(`/bookings/${id}`);
  },

  confirm(id: string) {
    return api.patch(`/bookings/${id}/confirm`);
  },

  reject(id: string) {
    return api.patch(`/bookings/${id}/reject`);
  },

  activate(id: string) {
    return api.patch(`/bookings/${id}/activate`);
  },

  complete(id: string) {
    return api.patch(`/bookings/${id}/complete`);
  },

  cancel(id: string) {
    return api.patch(`/bookings/${id}/cancel`);
  },

  requestExtend(id: string, body: { requested_end_date: string; reason?: string }) {
    return api.post(`/bookings/${id}/extend`, body);
  },

  approveExtend(id: string) {
    return api.patch(`/bookings/${id}/extend/approve`);
  },

  rejectExtend(id: string) {
    return api.patch(`/bookings/${id}/extend/reject`);
  },

  getOwnerStats() {
    return api.get('/bookings/owner/stats');
  },

  // kiểm tra quá hạn và trả máy
  renterReturn(id: string) {
    return api.patch(`/bookings/${id}/renter-return`);
  },
};
