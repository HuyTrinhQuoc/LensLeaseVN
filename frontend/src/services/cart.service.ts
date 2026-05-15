import api from './api';

export type MergeCartItemDto = {
  lens_id: string;
  start_date: string;
  end_date: string;
  quantity: number;
};

/** Chuẩn hoá từng phần tử guest cart / legacy về DTO backend `AddCartItemDto`. */
export function normalizeCartMergeItems(raw: unknown): MergeCartItemDto[] {
  if (!Array.isArray(raw)) return [];
  const out: MergeCartItemDto[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const lens_id = (r.lens_id ?? r.lensId) as string | undefined;
    let start_date = (r.start_date ?? r.startDate) as string | undefined;
    let end_date = (r.end_date ?? r.endDate) as string | undefined;
    const qty = Number(r.quantity ?? 1);
    if (!lens_id || !start_date || !end_date) continue;
    if (!Number.isFinite(qty) || qty < 1) continue;
    start_date = String(start_date).split('T')[0];
    end_date = String(end_date).split('T')[0];
    out.push({ lens_id, start_date, end_date, quantity: Math.min(50, Math.floor(qty)) });
  }
  return out;
}

export const cartService = {
  getCart() {
    return api.get('/cart');
  },

  updateItem(itemId: string, body: { start_date?: string; end_date?: string; quantity?: number }) {
    return api.patch(`/cart/items/${itemId}`, body);
  },

  removeItem(itemId: string) {
    return api.delete(`/cart/items/${itemId}`);
  },

  clearCart() {
    return api.delete('/cart');
  },

  addItem(body: { lens_id: string; start_date: string; end_date: string; quantity: number }) {
    return api.post('/cart/items', body);
  },

  /** Body phải là `{ items: AddCartItemDto[] }` — khớp `CartController.mergeCart`. */
  mergeCart(localItems: unknown[]) {
    const items = normalizeCartMergeItems(localItems);
    return api.post('/cart/merge', { items });
  },
};
