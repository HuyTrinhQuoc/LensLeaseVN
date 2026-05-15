import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { cartService } from '../services/cart.service';
import { getAuthToken } from '../utils/auth';
import {
  readGuestCart,
  upsertGuestCartItem,
  removeGuestCartByLensId,
  clearGuestCart,
  updateGuestCartDates,
  guestLineId,
  isGuestCartLineId,
  lensIdFromGuestLineId,
  type GuestCartStoredItem,
} from '../utils/guest-cart';
import { calculateRentalDaysLocal, parseDateOnlyLocal, toDateOnlyStringLocal, ymdFromApiDateField } from '../utils/date-only';

export interface CartItem {
  id: string;
  lensId?: string;
  name?: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  pricePerDay?: number;
  rentalDays?: number;
  startDate: string;
  endDate: string;
  quantity: number;
  deposit?: number;
  accessories?: string[];
  condition?: string;
  available?: boolean;
}

function guestRowsToContextItems(rows: GuestCartStoredItem[]): CartItem[] {
  return rows.map((r) => ({
    id: guestLineId(r.lens_id),
    lensId: r.lens_id,
    name: r.title,
    brand: r.brand,
    category: r.category_name,
    imageUrl: r.image_url,
    pricePerDay: r.price_per_day,
    rentalDays: calculateRentalDaysLocal(r.start_date, r.end_date),
    startDate: r.start_date,
    endDate: r.end_date,
    quantity: r.quantity,
    deposit: r.required_deposit_amount,
    available: true,
  }));
}

function flattenServerCart(json: { items_by_owner?: any[]; items?: any[] } | null | undefined): CartItem[] {
  const flat: CartItem[] = [];
  if (!json) return flat;

  if (json.items_by_owner?.length) {
    for (const group of json.items_by_owner) {
      for (const item of group.items || []) {
        const startYmd = ymdFromApiDateField(item.start_date);
        const endYmd = ymdFromApiDateField(item.end_date);
        flat.push({
          id: item.id,
          lensId: item.lens_id,
          name: item.lens?.title,
          brand: item.lens?.brand || 'Khác',
          category: item.lens?.category?.name,
          imageUrl:
            item.lens?.images?.[0]?.image_url ||
            item.lens?.images?.[0]?.url ||
            item.lens?.thumbnail,
          pricePerDay: Number(item.lens?.price_per_day ?? 0),
          rentalDays: calculateRentalDaysLocal(startYmd, endYmd),
          startDate: startYmd,
          endDate: endYmd,
          quantity: item.quantity,
          deposit: Number(item.lens?.required_deposit_amount || 0),
          available: item.is_available !== false,
        });
      }
    }
    return flat;
  }

  if (json.items?.length) {
    for (const item of json.items) {
      const startYmd = ymdFromApiDateField(item.start_date);
      const endYmd = ymdFromApiDateField(item.end_date);
      flat.push({
        id: item.id,
        lensId: item.lens_id,
        name: item.lens?.title,
        brand: item.lens?.brand,
        imageUrl: item.lens?.images?.[0]?.image_url || item.lens?.thumbnail,
        pricePerDay: Number(item.lens?.price_per_day ?? 0),
        rentalDays: calculateRentalDaysLocal(startYmd, endYmd),
        startDate: startYmd,
        endDate: endYmd,
        quantity: item.quantity,
        available: true,
      });
    }
  }
  return flat;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Record<string, unknown>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateDays: (id: string, delta: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  totalItems: number;
  loading: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setItems(guestRowsToContextItems(readGuestCart()));
      return;
    }

    try {
      setLoading(true);
      const res = await cartService.getCart();
      const payload = (res.data as { data?: { items_by_owner?: unknown[]; items?: unknown[] } })?.data ?? res.data;
      const flat = flattenServerCart(payload as { items_by_owner?: any[]; items?: any[] });
      setItems(flat);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'accessToken') void refreshCart();
      if (!getAuthToken() && e.key === 'cart') void refreshCart();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshCart]);

  const addItem = useCallback(
    async (item: Record<string, unknown>) => {
      const lens_id = String(item.lens_id ?? item.lensId ?? '');
      const start_date = String(item.start_date ?? item.startDate ?? '').split('T')[0];
      const end_date = String(item.end_date ?? item.endDate ?? '').split('T')[0];
      const quantity = Math.min(50, Math.max(1, Math.floor(Number(item.quantity ?? 1))));

      if (!getAuthToken()) {
        upsertGuestCartItem({
          lens_id,
          start_date,
          end_date,
          quantity,
          title: item.title != null ? String(item.title) : undefined,
          image_url: item.image_url != null ? String(item.image_url) : undefined,
          price_per_day: item.price_per_day != null ? Number(item.price_per_day) : undefined,
          brand: item.brand != null ? String(item.brand) : undefined,
          category_name: item.category_name != null ? String(item.category_name) : undefined,
          owner_name: item.owner_name != null ? String(item.owner_name) : undefined,
          owner_rating: item.owner_rating != null ? Number(item.owner_rating) : undefined,
          allowed_deposit_types: Array.isArray(item.allowed_deposit_types)
            ? (item.allowed_deposit_types as unknown[]).map(String)
            : undefined,
          required_deposit_amount:
            item.required_deposit_amount != null ? Number(item.required_deposit_amount) : undefined,
        });
        await refreshCart();
        return;
      }

      await cartService.addItem({ lens_id, start_date, end_date, quantity });
      await refreshCart();
    },
    [refreshCart],
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (isGuestCartLineId(id)) {
        const lid = lensIdFromGuestLineId(id);
        if (lid) removeGuestCartByLensId(lid);
        await refreshCart();
        return;
      }
      await cartService.removeItem(id);
      await refreshCart();
    },
    [refreshCart],
  );

  const updateDays = useCallback(
    async (id: string, delta: number) => {
      if (isGuestCartLineId(id)) {
        const lensId = lensIdFromGuestLineId(id);
        if (!lensId) return;
        const rows = readGuestCart();
        const row = rows.find((r) => r.lens_id === lensId);
        if (!row) return;
        const curDays = calculateRentalDaysLocal(row.start_date, row.end_date);
        const newDays = Math.max(1, Math.min(30, curDays + delta));
        const start = parseDateOnlyLocal(row.start_date);
        if (Number.isNaN(start.getTime())) {
          await refreshCart();
          return;
        }
        const end = new Date(start);
        end.setUTCDate(start.getUTCDate() + newDays);
        const newEnd = toDateOnlyStringLocal(end);
        updateGuestCartDates(lensId, { end_date: newEnd });
        await refreshCart();
        return;
      }

      const current = items.find((i) => i.id === id);
      if (!current?.startDate) return;
      const newDays = Math.max(1, Math.min(30, (current.rentalDays ?? 1) + delta));
      const start = parseDateOnlyLocal(current.startDate);
      if (Number.isNaN(start.getTime())) {
        await refreshCart();
        return;
      }
      const end = new Date(start);
      end.setUTCDate(start.getUTCDate() + newDays);
      const newEndDateStr = toDateOnlyStringLocal(end);
      await cartService.updateItem(id, { end_date: newEndDateStr });
      await refreshCart();
    },
    [items, refreshCart],
  );

  const clearCart = useCallback(async () => {
    if (!getAuthToken()) {
      clearGuestCart();
      await refreshCart();
      return;
    }
    await cartService.clearCart();
    await refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateDays,
        clearCart,
        refreshCart,
        totalItems: items.length,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải được sử dụng bên trong <CartProvider>');
  return ctx;
}
