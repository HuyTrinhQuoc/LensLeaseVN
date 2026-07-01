import api from './api';

export type ValidatePromotionResponse = {
  valid: boolean;
  promotion_id: string;
  code: string;
  discount_amount: number;
  discount_type: string;
  sponsor_type: string;
  message: string;
};

export type AvailablePromotion = {
  promotion_id: string;
  code: string;
  discount_amount: number;
  discount_type: string;
  sponsor_type: string;
  description: string;
  min_order_value: number | null;
  end_date: string;
};

export type AppliedPromotion = {
  code: string;
  discount_amount: number;
  message: string;
};

export type ManagedPromotion = {
  id: string;
  code: string;
  sponsor_type: 'PLATFORM' | 'OWNER';
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  min_order_value: number | null;
  max_discount_amount: number | null;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  description: string;
  creator?: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
  applicable_lenses: Array<{
    id: string;
    title: string;
  }>;
};

export type PromotionLensOption = {
  id: string;
  title: string;
  approval_status: string;
  available: boolean;
  price_per_day: number;
};

export type PromotionUpsertPayload = {
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  min_order_value?: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  is_active?: boolean;
  applicable_lens_ids?: string[];
};

export const PROMO_STORAGE_KEY = 'lenslease_promotion_code';

export const promotionService = {
  listAvailable(subTotal: number, lensIds?: string[]) {
    return api.post<{ message: string; data: AvailablePromotion[] }>(
      '/promotions/available',
      {
        sub_total: subTotal,
        lens_ids: lensIds,
      },
    );
  },

  validate(code: string, subTotal: number, lensIds?: string[]) {
    return api.post<{ message: string; data: ValidatePromotionResponse }>(
      '/promotions/validate',
      {
        code,
        sub_total: subTotal,
        lens_ids: lensIds,
      },
    );
  },

  listAdminManaged() {
    return api.get<{ message: string; data: ManagedPromotion[] }>('/admin/promotions');
  },

  createAdminManaged(body: PromotionUpsertPayload) {
    return api.post<{ message: string; data: ManagedPromotion }>('/admin/promotions', body);
  },

  updateAdminManaged(id: string, body: Partial<PromotionUpsertPayload>) {
    return api.patch<{ message: string; data: ManagedPromotion }>(`/admin/promotions/${id}`, body);
  },

  updateAdminManagedStatus(id: string, is_active: boolean) {
    return api.patch<{ message: string; data: ManagedPromotion }>(`/admin/promotions/${id}/status`, { is_active });
  },

  listOwnerManaged() {
    return api.get<{ message: string; data: ManagedPromotion[] }>('/owner/promotions');
  },

  listOwnerPromotionLenses() {
    return api.get<{ message: string; data: PromotionLensOption[] }>('/owner/promotions/lenses');
  },

  createOwnerManaged(body: PromotionUpsertPayload) {
    return api.post<{ message: string; data: ManagedPromotion }>('/owner/promotions', body);
  },

  updateOwnerManaged(id: string, body: Partial<PromotionUpsertPayload>) {
    return api.patch<{ message: string; data: ManagedPromotion }>(`/owner/promotions/${id}`, body);
  },

  updateOwnerManagedStatus(id: string, is_active: boolean) {
    return api.patch<{ message: string; data: ManagedPromotion }>(`/owner/promotions/${id}/status`, { is_active });
  },
};

export function setStoredPromotionCode(code: string | null) {
  if (code?.trim()) {
    sessionStorage.setItem(PROMO_STORAGE_KEY, code.trim());
  } else {
    sessionStorage.removeItem(PROMO_STORAGE_KEY);
  }
}

export function getStoredPromotionCode(): string | null {
  return sessionStorage.getItem(PROMO_STORAGE_KEY)?.trim() || null;
}
