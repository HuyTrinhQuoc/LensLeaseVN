import api from './api';

/**
 * Service quản lý các API liên quan đến ống kính / thiết bị cho thuê.
 */
export const lensService = {
  /** Lấy danh sách ống kính */
  getAll: () => api.get('/lenses'),

  /** Lấy chi tiết một ống kính theo ID */
  getById: (id: string) => api.get(`/lenses/${id}`),

  /** Tìm kiếm ống kính */
  search: (query: string) => api.get('/lenses/search', { params: { q: query } }),
};

/**
 * Service quản lý giỏ hàng.
 */
export const cartService = {
  /** Lấy giỏ hàng của người dùng hiện tại */
  getCart: () => api.get('/cart'),

  /** Thêm thiết bị vào giỏ */
  addItem: (lensId: string, rentalDays: number, startDate: string) =>
    api.post('/cart/items', { lensId, rentalDays, startDate }),

  /** Cập nhật số ngày thuê */
  updateItem: (itemId: string, rentalDays: number) =>
    api.patch(`/cart/items/${itemId}`, { rentalDays }),

  /** Xoá thiết bị khỏi giỏ */
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),

  /** Xoá toàn bộ giỏ */
  clearCart: () => api.delete('/cart'),
};
