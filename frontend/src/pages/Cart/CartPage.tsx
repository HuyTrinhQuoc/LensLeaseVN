import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/cart.css';
import { getAuthToken } from '../../utils/auth';
import { cartService } from '../../services/cart.service';
import { toDateOnlyStringLocal, parseDateOnlyLocal, calculateRentalDaysLocal, ymdFromApiDateField } from '../../utils/date-only';
import { platformFeeFromSubtotal, rentalLineSubtotal } from '../../utils/pricing';
import LensRentalSchedulePanel from '../../components/scheduling/LensRentalSchedulePanel';
import {
  readGuestCart,
  isGuestCartLineId,
  lensIdFromGuestLineId,
  removeGuestCartByLensId,
  clearGuestCart,
  updateGuestCartDates,
  guestLineId,
  type GuestCartStoredItem,
} from '../../utils/guest-cart';
import { useCart } from '../../context/CartContext';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
interface CartItem {
  id: string; // cart item id
  lensId: string; // lens id required for booking
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  pricePerDay: number;
  rentalDays: number;
  startDate: string;
  endDate: string;
  quantity: number;
  deposit: number;
  accessories: string[];
  condition: 'Mới' | 'Tốt' | 'Khá';
  available: boolean;

  ownerName: string;
  ownerAvatar?: string;
  ownerRating?: number;
  /** Giao của các `DepositType` lens cho phép — dùng ở checkout. */
  allowedDepositTypes: string[];
}

const PLACEHOLDER_IMG = 'https://placehold.co/120x120/e2e8f0/64748b?text=Lens';
const DEFAULT_DEPOSIT_TYPES = ['MONEY_PLATFORM', 'MONEY_DIRECT', 'PAPERWORK'] as const;

function guestRowToCartPageItem(r: GuestCartStoredItem): CartItem {
  const deposit =
    r.required_deposit_amount != null && Number.isFinite(Number(r.required_deposit_amount))
      ? Number(r.required_deposit_amount)
      : 0;
  return {
    id: guestLineId(r.lens_id),
    lensId: r.lens_id,
    name: r.title || 'Thiết bị',
    brand: r.brand || 'Khác',
    category: r.category_name || 'Máy ảnh & Ống kính',
    imageUrl: r.image_url || PLACEHOLDER_IMG,
    pricePerDay: Number(r.price_per_day ?? 0),
    rentalDays: calculateRentalDaysLocal(r.start_date, r.end_date),
    startDate: r.start_date,
    endDate: r.end_date,
    quantity: r.quantity,
    deposit,
    accessories: [],
    condition: 'Tốt',
    available: true,
    ownerName: r.owner_name || 'Chủ thiết bị',
    ownerRating: r.owner_rating,
    allowedDepositTypes:
      Array.isArray(r.allowed_deposit_types) && r.allowed_deposit_types.length > 0
        ? [...r.allowed_deposit_types]
        : [...DEFAULT_DEPOSIT_TYPES],
  };
}

/* ────────────────────────────────────────────
   Utility helpers
   ──────────────────────────────────────────── */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim());
  if (!m) return '';
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function getConditionBadge(condition: string) {
  switch (condition) {
    case 'Mới':
      return 'cart-badge--new';
    case 'Tốt':
      return 'cart-badge--good';
    default:
      return 'cart-badge--fair';
  }
}

/* ────────────────────────────────────────────
   Icon helper
   ──────────────────────────────────────────── */
function Icon({ name, filled = false, className = '' }: { name: string; filled?: boolean; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={
        filled
          ? ({ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' } as React.CSSProperties)
          : undefined
      }
    >
      {name}
    </span>
  );
}

/* ────────────────────────────────────────────
   CartPage Component
   ──────────────────────────────────────────── */
export default function CartPage() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // ── Fetch Cart from API ──
  const fetchCart = useCallback(async () => {
    if (!getAuthToken()) {
      setLoading(true);
      try {
        const mapped = readGuestCart().map(guestRowToCartPageItem);
        setItems(mapped);
        setSelectedItems((prev) => {
          const next = new Set<string>();
          for (const id of prev) {
            if (mapped.some((i) => i.id === id)) next.add(id);
          }
          return next;
        });
      } finally {
        setLoading(false);
        void refreshCart();
      }
      return;
    }
    try {
      setLoading(true);
      const res = await cartService.getCart();
      const json = res.data as { data?: { items_by_owner?: unknown[] } };

      if (json.data && json.data.items_by_owner) {
        const flatItems: CartItem[] = [];
        (json.data.items_by_owner as any[]).forEach((group: any) => {
          group.items.forEach((item: any) => {
            const startYmd = ymdFromApiDateField(item.start_date);
            const endYmd = ymdFromApiDateField(item.end_date);
            flatItems.push({
              id: item.id,
              lensId: item.lens_id,
              name: item.lens.title,
              brand: item.lens.brand || 'Khác',
              category: item.lens.category?.name || 'Máy ảnh & Ống kính',
              imageUrl: item.lens.images?.[0]?.image_url || item.lens.images?.[0]?.url || item.lens.thumbnail || PLACEHOLDER_IMG,
              pricePerDay: Number(item.lens.price_per_day),
              rentalDays: calculateRentalDaysLocal(startYmd, endYmd),
              startDate: startYmd,
              endDate: endYmd,
              quantity: item.quantity,
              deposit: Number(item.lens.required_deposit_amount || 0),
              accessories: [],
              condition: 'Tốt', // Placeholder
              available: item.is_available,
              ownerName: group.owner.full_name,
              ownerRating: group.owner.rating_avg,
              allowedDepositTypes: Array.isArray(item.lens?.allowed_deposit_types)
                ? [...item.lens.allowed_deposit_types]
                : ['MONEY_PLATFORM', 'MONEY_DIRECT', 'PAPERWORK'],
            });
          });
        });
        setItems(flatItems);
        // Mặc định chọn tất cả các sản phẩm khả dụng
        setSelectedItems((prev) => {
          if (prev.size > 0) return prev;
          return new Set(flatItems.filter((i) => i.available).map((i) => i.id));
        });
        void refreshCart();
      }
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng:', error);
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ── Toggle item selection ──
  const toggleSelect = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedItems((prev) => {
      const availableItems = items.filter(i => i.available);
      if (prev.size === availableItems.length) return new Set();
      return new Set(availableItems.map((i) => i.id));
    });
  }, [items]);

  // ── Rental days controls (Call PATCH API) ──
  const updateDays = useCallback(
    async (id: string, delta: number) => {
      if (isGuestCartLineId(id)) {
        const lensId = lensIdFromGuestLineId(id);
        if (!lensId) return;
        const row = readGuestCart().find((r) => r.lens_id === lensId);
        if (!row) return;
        const newDays = Math.max(1, Math.min(30, calculateRentalDaysLocal(row.start_date, row.end_date) + delta));
        const start = parseDateOnlyLocal(row.start_date);
        if (Number.isNaN(start.getTime())) {
          void fetchCart();
          return;
        }
        const end = new Date(start);
        end.setUTCDate(start.getUTCDate() + newDays);
        const newEndDateStr = toDateOnlyStringLocal(end);
        updateGuestCartDates(lensId, { end_date: newEndDateStr });
        setItems((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, rentalDays: newDays, endDate: newEndDateStr } : i,
          ),
        );
        void refreshCart();
        return;
      }

      const item = items.find((i) => i.id === id);
      if (!item) return;

      const newDays = Math.max(1, Math.min(30, item.rentalDays + delta));
      const start = parseDateOnlyLocal(item.startDate);
      if (Number.isNaN(start.getTime())) {
        void fetchCart();
        return;
      }
      const end = new Date(start);
      end.setUTCDate(start.getUTCDate() + newDays);
      const newEndDateStr = toDateOnlyStringLocal(end);

      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, rentalDays: newDays, endDate: newEndDateStr } : i)),
      );

      try {
        await cartService.updateItem(id, { end_date: newEndDateStr });
      } catch (error) {
        console.error('Lỗi cập nhật ngày thuê:', error);
        void fetchCart();
      }
    },
    [items, fetchCart, refreshCart],
  );

  // ── Remove item (Call DELETE API) ──
  const removeItem = useCallback(
    async (id: string) => {
      if (isGuestCartLineId(id)) {
        const lid = lensIdFromGuestLineId(id);
        if (lid) removeGuestCartByLensId(lid);
        setItems((prev) => prev.filter((item) => item.id !== id));
        setSelectedItems((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        void refreshCart();
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedItems((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      try {
        await cartService.removeItem(id);
      } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        void fetchCart();
      }
    },
    [fetchCart, refreshCart],
  );

  // ── Xóa các item đã chọn (Gọi API xóa từng cái hoặc xóa trắng giỏ) ──
  const removeSelectedItems = async () => {
    if (!getAuthToken()) {
      if (selectedItems.size === items.length && items.length > 0) {
        clearGuestCart();
        setItems([]);
        setSelectedItems(new Set());
        void refreshCart();
      } else {
        for (const id of Array.from(selectedItems)) {
          await removeItem(id);
        }
      }
      return;
    }

    if (selectedItems.size === items.length) {
      try {
        await cartService.clearCart();
        setItems([]);
        setSelectedItems(new Set());
        void refreshCart();
      } catch (error) {
        console.error('Lỗi xóa toàn bộ giỏ hàng:', error);
      }
    } else {
      for (const id of Array.from(selectedItems)) {
        await removeItem(id);
      }
    }
  };

  // ── Tổng tiền khớp backend: tiền thuê + phí sàn 8% / dòng; ký quỹ trừ khi chủ duyệt ──
  const selectedItemsList = items.filter((i) => selectedItems.has(i.id));
  const subtotal = selectedItemsList.reduce(
    (sum, i) => sum + rentalLineSubtotal(i.pricePerDay, i.rentalDays, i.quantity),
    0,
  );
  const platformFeeTotal = selectedItemsList.reduce(
    (sum, i) =>
      sum + platformFeeFromSubtotal(rentalLineSubtotal(i.pricePerDay, i.rentalDays, i.quantity)),
    0,
  );
  const totalDeposit = selectedItemsList.reduce((sum, i) => sum + i.deposit * i.quantity, 0);
  const rentalPlusPlatform = subtotal + platformFeeTotal;
  const totalWhenOwnersConfirm = rentalPlusPlatform + totalDeposit;
  const totalItems = selectedItemsList.length;

  if (loading) {
    return (
      <div className="cart-page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p>Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
        <div className="cart-content">
          {/* ── Page Header ── */}
          <section className="cart-header">
            <div className="cart-header__left">
              <h2>
                <Icon name="shopping_cart" className="cart-header__icon" />
                Giỏ hàng của bạn
              </h2>
              <p className="cart-header__subtitle">
                <span className="cart-header__count">{items.length}</span> thiết bị đang chờ thuê
              </p>
            </div>
            <div className="cart-header__right">
              <button className="cart-btn-outline" onClick={() => window.history.back()}>
                <Icon name="arrow_back" />
                Tiếp tục khám phá
              </button>
            </div>
          </section>

          {/* ── Main Layout: Cart items + Summary ── */}
          <div className="cart-layout">
            {/* ── LEFT: Cart Items ── */}
            <div className="cart-items-column">
              {/* Select All Bar */}
              <div className="cart-select-bar">
                <label className="cart-select-bar__check">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === items.filter(i => i.available).length && items.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <span>Chọn tất cả ({items.length} sản phẩm)</span>
                </label>
                {selectedItems.size > 0 && (
                  <button
                    className="cart-select-bar__remove"
                    onClick={removeSelectedItems}
                  >
                    <Icon name="delete_sweep" />
                    Xoá đã chọn ({selectedItems.size})
                  </button>
                )}
              </div>

              {/* Cart items list */}
              {items.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty__icon">
                    <Icon name="shopping_cart" />
                  </div>
                  <h3>Giỏ hàng trống</h3>
                  <p>Bạn chưa thêm thiết bị nào vào giỏ hàng.</p>
                  <button className="cart-btn-primary cart-btn-primary--lg" onClick={() => navigate('/products')}>
                    <Icon name="explore" />
                    Khám phá thiết bị
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {items.map((item, index) => (
                    <article
                      key={item.id}
                      className={`cart-item ${selectedItems.has(item.id) ? 'is-selected' : ''} ${!item.available ? 'is-unavailable' : ''}`}
                      style={{ animationDelay: `${index * 0.08}s`, opacity: item.available ? 1 : 0.5 }}
                    >
                      {/* Checkbox */}
                      <div className="cart-item__check">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          disabled={!item.available}
                        />
                      </div>

                      {/* Image */}
                      <div className="cart-item__image">
                        <img src={item.imageUrl} alt={item.name} />
                        {item.available ? (
                           <span className={`cart-badge ${getConditionBadge(item.condition)}`}>
                             {item.condition}
                           </span>
                        ) : (
                           <span className="cart-badge" style={{ background: '#ef4444' }}>
                             Hết hàng
                           </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="cart-item__content">
                        <div className="cart-item__top">
                          <div className="cart-item__info">
                            <span className="cart-item__category">
                              <Icon name="storefront" />
                              Chủ máy: {item.ownerName}
                            </span>
                            <h3 className="cart-item__name">{item.name}</h3>
                            <p className="cart-item__brand">
                              <Icon name="camera" />
                              {item.brand}
                            </p>
                          </div>
                          <button
                            className="cart-item__remove"
                            onClick={() => removeItem(item.id)}
                            aria-label="Xóa khỏi giỏ"
                          >
                            <Icon name="close" />
                          </button>
                        </div>

                        {/* Bottom row: dates + price + days */}
                        <div className="cart-item__bottom">
                          <div className="cart-item__dates">
                            <div className="cart-item__date-block">
                              <span className="cart-item__date-label">
                                <Icon name="event" /> Ngày nhận
                              </span>
                              <span className="cart-item__date-value">{formatDate(item.startDate)}</span>
                            </div>
                            <div className="cart-item__date-arrow">
                              <Icon name="arrow_forward" />
                            </div>
                            <div className="cart-item__date-block">
                              <span className="cart-item__date-label">
                                <Icon name="event_available" /> Ngày trả
                              </span>
                              <span className="cart-item__date-value">{formatDate(item.endDate)}</span>
                            </div>
                          </div>

                          <div className="cart-item__price-section">
                            <div className="cart-item__days-control">
                              <button
                                onClick={() => updateDays(item.id, -1)}
                                className="cart-item__days-btn"
                                disabled={item.rentalDays <= 1 || !item.available}
                              >
                                <Icon name="remove" />
                              </button>
                              <span className="cart-item__days-value">
                                {item.rentalDays} <small>ngày</small>
                              </span>
                              <button
                                onClick={() => updateDays(item.id, 1)}
                                className="cart-item__days-btn"
                                disabled={item.rentalDays >= 30 || !item.available}
                              >
                                <Icon name="add" />
                              </button>
                            </div>
                            <div className="cart-item__price">
                              <span className="cart-item__price-unit">{formatCurrency(item.pricePerDay)}/ngày</span>
                              <span className="cart-item__price-total">
                                {formatCurrency(rentalLineSubtotal(item.pricePerDay, item.rentalDays, item.quantity))}
                              </span>
                            </div>
                          </div>
                        </div>
                        <LensRentalSchedulePanel
                          lensId={item.lensId}
                          startDate={item.startDate}
                          endDate={item.endDate}
                          quantity={item.quantity}
                          productDetailHref={`/products/${item.lensId}`}
                          variant="compact"
                          collapsible
                          defaultOpen={false}
                          className="!shadow-none"
                        />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <aside className="cart-summary-column">
              {/* Deposit Warning */}
              <div className="cart-deposit-notice">
                <div className="cart-deposit-notice__icon">
                  <Icon name="shield" filled />
                </div>
                <div>
                  <h4>Tiền ký quỹ bảo đảm</h4>
                  <p>
                    Tiền cọc sẽ được giữ trong Ví Ký Quỹ và hoàn trả sau khi bạn trả thiết bị đúng hẹn & nguyên vẹn.
                  </p>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="cart-summary-card">
                <h3 className="cart-summary-card__title">
                  <Icon name="receipt_long" />
                  Tóm tắt đơn hàng
                </h3>

                {/* Selected items mini-list */}
                {selectedItemsList.length > 0 && (
                  <div className="cart-summary-items">
                    {selectedItemsList.map((item) => (
                      <div key={item.id} className="cart-summary-item">
                        <img src={item.imageUrl} alt={item.name} />
                        <div className="cart-summary-item__info">
                          <p className="cart-summary-item__name">{item.name.split(' + ')[0]}</p>
                          <p className="cart-summary-item__detail">
                            {item.rentalDays} ngày × {formatCurrency(item.pricePerDay)}
                          </p>
                        </div>
                        <span className="cart-summary-item__total">
                          {formatCurrency(rentalLineSubtotal(item.pricePerDay, item.rentalDays, item.quantity))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="cart-summary-card__divider" />

                {/* Cost breakdown */}
                <div className="cart-summary-card__rows">
                  <div className="cart-summary-card__row">
                    <span>Tiền thuê ({totalItems} thiết bị)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="cart-summary-card__row">
                    <span>
                      Phí sàn (8%)
                      <button
                        className="cart-summary-card__info-btn"
                        title="Khớp backend: 8% trên tiền thuê từng dòng, làm tròn 2 chữ số"
                      >
                        <Icon name="info" />
                      </button>
                    </span>
                    <span>{formatCurrency(platformFeeTotal)}</span>
                  </div>
                </div>

                <div className="cart-summary-card__divider" />

                {/* Deposit summary */}
                <div className="cart-summary-card__rows">
                  <div className="cart-summary-card__row cart-summary-card__row--deposit">
                    <span>
                      <Icon name="lock" />
                      Tổng tiền ký quỹ
                    </span>
                    <span>{formatCurrency(totalDeposit)}</span>
                  </div>
                </div>

                <div className="cart-summary-card__divider" />

                {/* Grand total */}
                <div className="cart-summary-card__total">
                  <div className="cart-summary-card__total-row">
                    <span>Tiền thuê + phí sàn (dự kiến)</span>
                    <span className="cart-summary-card__total-value">{formatCurrency(rentalPlusPlatform)}</span>
                  </div>
                  <p className="cart-summary-card__total-note">
                    Khi chủ máy duyệt đơn: trừ ví thêm ký quỹ {formatCurrency(totalDeposit)} (nếu chọn cọc nền
                    tảng). Tổng tối đa một lượt: {formatCurrency(totalWhenOwnersConfirm)}.
                  </p>
                </div>

                {/* Checkout button */}
                <button
                  className="cart-btn-checkout"
                  disabled={selectedItemsList.length === 0}
                  onClick={() => {
                    if (!getAuthToken()) {
                      navigate('/login', { state: { cartReturn: true } });
                      return;
                    }
                    navigate('/checkout', { state: { selectedItems: selectedItemsList } });
                  }}
                >
                  <Icon name="shopping_cart_checkout" />
                  Tiến hành đặt thuê
                  {selectedItemsList.length > 0 && (
                    <span className="cart-btn-checkout__amount">
                      {formatCurrency(totalWhenOwnersConfirm)}
                    </span>
                  )}
                </button>

                {/* Trust badges */}
                <div className="cart-trust-badges">
                  <div className="cart-trust-badge">
                    <Icon name="verified_user" filled />
                    <span>Bảo vệ thanh toán</span>
                  </div>
                  <div className="cart-trust-badge">
                    <Icon name="autorenew" filled />
                    <span>Hoàn ký quỹ 100%</span>
                  </div>
                  <div className="cart-trust-badge">
                    <Icon name="support_agent" filled />
                    <span>Hỗ trợ 24/7</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
    </div>
  );
}

