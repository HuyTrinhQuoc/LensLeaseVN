import type { NavigateFunction } from 'react-router-dom';
import { calculateRentalDaysLocal } from './date-only';
import { getAuthToken } from './auth';
import { ekycService } from '../services/ekyc.service';

export const INSTANT_CHECKOUT_STORAGE_KEY = 'lenslease_instant_checkout';

const DEFAULT_DEPOSIT_TYPES = ['MONEY_PLATFORM', 'MONEY_DIRECT', 'PAPERWORK'] as const;

export type CheckoutSelectedItem = {
  id: string;
  lensId: string;
  name: string;
  imageUrl: string;
  ownerName: string;
  ownerRating?: number;
  startDate: string;
  endDate: string;
  rentalDays: number;
  quantity: number;
  pricePerDay: number;
  deposit: number;
  allowedDepositTypes: string[];
};

const PLACEHOLDER_IMG = 'https://placehold.co/120x120/e2e8f0/64748b?text=Lens';

export function instantCheckoutLineId(lensId: string): string {
  return `instant:${lensId}`;
}

export function isInstantCheckoutLineId(id: string): boolean {
  return id.startsWith('instant:');
}

/** Chỉ gửi `cart_item_ids` thật từ DB — bỏ dòng đặt ngay / giỏ khách. */
export function isRealCartItemId(id: string): boolean {
  return Boolean(id) && !isInstantCheckoutLineId(id) && !id.startsWith('guest:');
}

export function buildInstantCheckoutItem(opts: {
  lensId: string;
  title: string;
  imageUrl?: string;
  ownerName?: string;
  ownerRating?: number;
  startDate: string;
  endDate: string;
  pricePerDay: number;
  deposit: number;
  allowedDepositTypes?: string[];
  quantity?: number;
}): CheckoutSelectedItem {
  const qty = opts.quantity ?? 1;
  return {
    id: instantCheckoutLineId(opts.lensId),
    lensId: opts.lensId,
    name: opts.title,
    imageUrl: opts.imageUrl || PLACEHOLDER_IMG,
    ownerName: opts.ownerName || 'Chủ thiết bị',
    ownerRating: opts.ownerRating,
    startDate: opts.startDate,
    endDate: opts.endDate,
    rentalDays: calculateRentalDaysLocal(opts.startDate, opts.endDate),
    quantity: qty,
    pricePerDay: opts.pricePerDay,
    deposit: opts.deposit,
    allowedDepositTypes:
      Array.isArray(opts.allowedDepositTypes) && opts.allowedDepositTypes.length > 0
        ? [...opts.allowedDepositTypes]
        : [...DEFAULT_DEPOSIT_TYPES],
  };
}

export function stashInstantCheckout(selectedItems: CheckoutSelectedItem[]): void {
  sessionStorage.setItem(INSTANT_CHECKOUT_STORAGE_KEY, JSON.stringify({ selectedItems }));
}

export function consumeInstantCheckout(): CheckoutSelectedItem[] | null {
  const raw = sessionStorage.getItem(INSTANT_CHECKOUT_STORAGE_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(INSTANT_CHECKOUT_STORAGE_KEY);
  try {
    const parsed = JSON.parse(raw) as { selectedItems?: CheckoutSelectedItem[] };
    return parsed.selectedItems?.length ? parsed.selectedItems : null;
  } catch {
    return null;
  }
}

export async function proceedToCheckoutOrVerification(
  navigate: NavigateFunction,
  selectedItems: CheckoutSelectedItem[],
): Promise<void> {
  const state = { selectedItems };
  try {
    const res = await ekycService.getStatus();
    if (res.data?.is_verified) {
      navigate('/checkout', { state });
    } else {
      navigate('/Verification', { state });
    }
  } catch {
    navigate('/Verification', { state });
  }
}

/** Đặt ngay: bỏ qua giỏ, chuyển thẳng eKYC / checkout với một dòng. */
export async function navigateToInstantCheckout(
  navigate: NavigateFunction,
  selectedItems: CheckoutSelectedItem[],
): Promise<void> {
  if (!getAuthToken()) {
    stashInstantCheckout(selectedItems);
    navigate('/login', { state: { instantReturn: true } });
    return;
  }
  await proceedToCheckoutOrVerification(navigate, selectedItems);
}
