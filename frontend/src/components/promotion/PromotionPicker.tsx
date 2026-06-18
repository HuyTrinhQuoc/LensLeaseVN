import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type AppliedPromotion,
  type AvailablePromotion,
  getStoredPromotionCode,
  promotionService,
  setStoredPromotionCode,
} from '../../services/promotion.service';

function Icon({ name, filled = false }: { name: string; filled?: boolean }) {
  return (
    <span
      className="material-symbols-outlined"
      style={
        filled
          ? ({ fontVariationSettings: '"FILL" 1' } as React.CSSProperties)
          : undefined
      }
    >
      {name}
    </span>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

function formatExpiry(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export type PromotionPickerProps = {
  subtotal: number;
  lensIds: string[];
  appliedPromo: AppliedPromotion | null;
  onChange: (promo: AppliedPromotion | null) => void;
  disabled?: boolean;
  /** cart = dùng class cart-coupon; checkout = tailwind card */
  variant?: 'cart' | 'checkout';
};

export function PromotionPicker({
  subtotal,
  lensIds,
  appliedPromo,
  onChange,
  disabled = false,
  variant = 'cart',
}: PromotionPickerProps) {
  const [available, setAvailable] = useState<AvailablePromotion[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const restoredRef = useRef(false);
  const lensKey = lensIds.slice().sort().join(',');

  const applyByCode = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) {
        setCouponError('Vui lòng nhập mã giảm giá');
        return;
      }
      if (subtotal <= 0) {
        setCouponError('Không có tiền thuê để áp dụng mã');
        return;
      }

      setCouponLoading(true);
      setCouponError('');
      try {
        const res = await promotionService.validate(trimmed, subtotal, lensIds);
        const data = res.data?.data;
        if (!data?.valid) {
          setCouponError('Mã giảm giá không hợp lệ');
          onChange(null);
          setStoredPromotionCode(null);
          return;
        }
        const promo: AppliedPromotion = {
          code: data.code,
          discount_amount: data.discount_amount,
          message: data.message,
        };
        onChange(promo);
        setCouponInput(data.code);
        setStoredPromotionCode(data.code);
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string | string[] } } }).response?.data
                ?.message
            : undefined;
        const text = Array.isArray(msg) ? msg.join(', ') : msg;
        setCouponError(text || 'Không thể áp dụng mã giảm giá');
        onChange(null);
        setStoredPromotionCode(null);
      } finally {
        setCouponLoading(false);
      }
    },
    [subtotal, lensIds, onChange],
  );

  const handleClear = useCallback(() => {
    onChange(null);
    setCouponInput('');
    setCouponError('');
    setStoredPromotionCode(null);
  }, [onChange]);

  const handleSelectAvailable = useCallback(
    (item: AvailablePromotion) => {
      if (appliedPromo?.code === item.code) {
        handleClear();
        return;
      }
      const promo: AppliedPromotion = {
        code: item.code,
        discount_amount: item.discount_amount,
        message: `Áp dụng mã ${item.code} — giảm ${item.discount_amount.toLocaleString('vi-VN')}đ`,
      };
      onChange(promo);
      setCouponInput(item.code);
      setCouponError('');
      setStoredPromotionCode(item.code);
    },
    [appliedPromo?.code, handleClear, onChange],
  );

  useEffect(() => {
    if (subtotal <= 0 || lensIds.length === 0) {
      setAvailable([]);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoadingList(true);
      try {
        const res = await promotionService.listAvailable(subtotal, lensIds);
        if (!cancelled) setAvailable(res.data?.data ?? []);
      } catch {
        if (!cancelled) setAvailable([]);
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [subtotal, lensKey, lensIds]);

  useEffect(() => {
    if (restoredRef.current || appliedPromo) return;
    const stored = getStoredPromotionCode();
    if (!stored || subtotal <= 0 || lensIds.length === 0) {
      restoredRef.current = true;
      return;
    }
    restoredRef.current = true;
    setCouponInput(stored);
    void applyByCode(stored);
  }, [appliedPromo, applyByCode, lensIds.length, subtotal]);

  const isCheckout = variant === 'checkout';

  return (
    <div className={isCheckout ? 'space-y-3' : 'cart-coupon'}>
      <span className={isCheckout ? 'text-sm font-bold text-gray-800' : 'cart-coupon__label'}>
        Mã khuyến mãi
      </span>

      {loadingList ? (
        <p className={isCheckout ? 'text-xs text-gray-500' : 'cart-coupon__error'} style={{ color: '#64748b' }}>
          Đang tải mã khả dụng…
        </p>
      ) : available.length > 0 ? (
        <div className={isCheckout ? 'flex flex-col gap-2' : 'cart-promo-list'}>
          {available.map((item) => {
            const selected = appliedPromo?.code === item.code;
            return (
              <button
                key={item.promotion_id}
                type="button"
                disabled={disabled || couponLoading}
                onClick={() => handleSelectAvailable(item)}
                className={
                  isCheckout
                    ? `flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                        selected
                          ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200'
                          : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40'
                      }`
                    : `cart-promo-card${selected ? ' is-selected' : ''}`
                }
              >
                <div
                  className={
                    isCheckout
                      ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0b45b3] shadow-sm'
                      : 'cart-promo-card__icon'
                  }
                >
                  <Icon name="local_offer" filled={selected} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={isCheckout ? 'font-bold text-gray-900' : 'cart-promo-card__code'}>
                      {item.code}
                    </span>
                    <span className={isCheckout ? 'text-xs font-semibold text-emerald-700' : 'cart-promo-card__save'}>
                      −{formatCurrency(item.discount_amount)}
                    </span>
                  </div>
                  <p className={isCheckout ? 'mt-0.5 text-xs text-gray-600' : 'cart-promo-card__desc'}>
                    {item.description}
                    {item.min_order_value != null && item.min_order_value > 0
                      ? ` · Đơn tối thiểu ${formatCurrency(item.min_order_value)}`
                      : ''}
                  </p>
                  <p className={isCheckout ? 'text-[11px] text-gray-400' : 'cart-promo-card__exp'}>
                    HSD: {formatExpiry(item.end_date)}
                  </p>
                </div>
                {selected && (
                  <Icon name="check_circle" filled />
                )}
              </button>
            );
          })}
        </div>
      ) : subtotal > 0 && lensIds.length > 0 ? (
        <p className={isCheckout ? 'text-xs text-gray-500' : 'cart-coupon__error'} style={{ color: '#64748b' }}>
          Chưa có mã khuyến mãi phù hợp — bạn có thể nhập mã thủ công bên dưới.
        </p>
      ) : null}

      <div className={isCheckout ? 'flex gap-2' : 'cart-coupon__input-wrap'}>
        {!isCheckout && <Icon name="local_offer" />}
        {isCheckout && (
          <span className="material-symbols-outlined self-center pl-1 text-gray-400">sell</span>
        )}
        <input
          type="text"
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
          placeholder="Hoặc nhập mã thủ công"
          disabled={disabled || !!appliedPromo || couponLoading}
          className={
            isCheckout
              ? 'min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-[#0b45b3] disabled:bg-gray-50'
              : undefined
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !appliedPromo) {
              e.preventDefault();
              void applyByCode(couponInput);
            }
          }}
        />
        {appliedPromo ? (
          <button
            type="button"
            className={isCheckout ? 'rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold' : 'cart-coupon__clear-btn'}
            onClick={handleClear}
          >
            Bỏ
          </button>
        ) : (
          <button
            type="button"
            className={isCheckout ? 'rounded-lg bg-[#0b45b3] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50' : 'cart-coupon__btn'}
            disabled={disabled || couponLoading || !couponInput.trim()}
            onClick={() => void applyByCode(couponInput)}
          >
            {couponLoading ? '…' : 'Áp dụng'}
          </button>
        )}
      </div>

      {couponError && (
        <p className={isCheckout ? 'text-xs text-red-600' : 'cart-coupon__error'}>{couponError}</p>
      )}
      {appliedPromo?.message && (
        <div className={isCheckout ? 'flex items-center gap-1 text-xs font-semibold text-emerald-700' : 'cart-coupon__success'}>
          <Icon name="check_circle" filled />
          <span>{appliedPromo.message}</span>
        </div>
      )}
    </div>
  );
}
