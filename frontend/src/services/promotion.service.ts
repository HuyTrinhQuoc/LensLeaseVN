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
