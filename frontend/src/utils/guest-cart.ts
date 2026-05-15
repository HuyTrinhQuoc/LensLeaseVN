/**
 * Giỏ khách — lưu `localStorage` key `cart` (cùng key với merge sau login trong `Auth.tsx`).
 * Mỗi dòng: một `lens_id` (trùng backend: thêm lại = cập nhật ngày/số lượng).
 */

export const GUEST_CART_STORAGE_KEY = 'cart';

export type GuestCartStoredItem = {
  lens_id: string;
  start_date: string;
  end_date: string;
  quantity: number;
  title?: string;
  image_url?: string;
  price_per_day?: number;
  brand?: string;
  category_name?: string;
  owner_name?: string;
  owner_rating?: number;
  allowed_deposit_types?: string[];
  required_deposit_amount?: number;
};

export function guestLineId(lensId: string): string {
  return `guest:${lensId}`;
}

export function isGuestCartLineId(id: string): boolean {
  return id.startsWith('guest:');
}

export function lensIdFromGuestLineId(id: string): string | null {
  if (!isGuestCartLineId(id)) return null;
  return id.slice('guest:'.length);
}

export function readGuestCart(): GuestCartStoredItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: GuestCartStoredItem[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== 'object') continue;
      const r = row as Record<string, unknown>;
      const lens_id = String(r.lens_id ?? r.lensId ?? '').trim();
      let start_date = String(r.start_date ?? r.startDate ?? '').split('T')[0];
      let end_date = String(r.end_date ?? r.endDate ?? '').split('T')[0];
      const quantity = Math.min(50, Math.max(1, Math.floor(Number(r.quantity ?? 1))));
      if (!lens_id || !start_date || !end_date) continue;
      out.push({
        lens_id,
        start_date,
        end_date,
        quantity,
        title: r.title != null ? String(r.title) : undefined,
        image_url: r.image_url != null ? String(r.image_url) : undefined,
        price_per_day: r.price_per_day != null ? Number(r.price_per_day) : undefined,
        brand: r.brand != null ? String(r.brand) : undefined,
        category_name: r.category_name != null ? String(r.category_name) : undefined,
        owner_name: r.owner_name != null ? String(r.owner_name) : undefined,
        owner_rating: r.owner_rating != null ? Number(r.owner_rating) : undefined,
        allowed_deposit_types: Array.isArray(r.allowed_deposit_types)
          ? (r.allowed_deposit_types as unknown[]).map(String)
          : undefined,
        required_deposit_amount:
          r.required_deposit_amount != null ? Number(r.required_deposit_amount) : undefined,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export function writeGuestCart(items: GuestCartStoredItem[]): void {
  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
}

export function upsertGuestCartItem(next: GuestCartStoredItem): void {
  const cur = readGuestCart();
  const idx = cur.findIndex((r) => r.lens_id === next.lens_id);
  if (idx >= 0) {
    cur[idx] = { ...cur[idx], ...next };
  } else {
    cur.push({ ...next });
  }
  writeGuestCart(cur);
}

export function removeGuestCartByLensId(lensId: string): void {
  writeGuestCart(readGuestCart().filter((r) => r.lens_id !== lensId));
}

export function clearGuestCart(): void {
  localStorage.removeItem(GUEST_CART_STORAGE_KEY);
}

export function updateGuestCartDates(
  lensId: string,
  patch: Partial<Pick<GuestCartStoredItem, 'start_date' | 'end_date' | 'quantity'>>,
): void {
  const cur = readGuestCart();
  const idx = cur.findIndex((r) => r.lens_id === lensId);
  if (idx < 0) return;
  cur[idx] = { ...cur[idx], ...patch };
  writeGuestCart(cur);
}
