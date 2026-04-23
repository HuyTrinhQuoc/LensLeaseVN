import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/cart.css';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
interface CartItem {
  id: string;
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
}

/* ────────────────────────────────────────────
   Mock Data
   ──────────────────────────────────────────── */
const initialCartItems: CartItem[] = [
  {
    id: 'LL-001',
    name: 'Sony Alpha A7 IV + FE 24-70mm f/2.8 GM',
    brand: 'Sony',
    category: 'Máy ảnh & Ống kính',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr4Wzm6DlzaPaPltjeEdBxG8_OxrXPzLblDd_vJuwEFk2OZmea0Z6MORmwvm8cBMfi3hSzDmwUBdm77N2B48F1_ovWBI3yo0lxrLpQYSGv58yKZLzF6JvLyCVXNkLTHI7l8ExGQtTNoZ1WN3aupNVx5dIlLfjcGkUFBKyCuadLsXWL9nwghC3SxxKVeXYL9_la4ok0cSvyKpDOah7aVJn3AyPsOO_tJYXaQAL6a0QvgRoVaufoPfS4XEHrlWaBQOZbqxSymkCm2MI',
    pricePerDay: 850000,
    rentalDays: 5,
    startDate: '2024-05-15',
    endDate: '2024-05-20',
    quantity: 1,
    deposit: 5000000,
    accessories: ['Pin NP-FZ100 x2', 'Sạc rời', 'Thẻ nhớ SD 128GB'],
    condition: 'Mới',
    available: true,
  },
  {
    id: 'LL-002',
    name: 'Canon EOS R5 (Body Only)',
    brand: 'Canon',
    category: 'Máy ảnh',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP-oR8imkp_p4qhEkVvZFSZ4qOLR5eq4MJMvU00c68wN1Or3ih-GevKPLo6YSEStNlw4l7hkjorSE2r6ZEltEeT9_0U3Qu3ECIu-n-3KsH358mEyHk2-Yu8ReZOyMvfSrbmNBg9EbVJjky6aw-5q6MEFrVMKGfcQ2W_ne7MG3st3wStmeOMHBSW4CvJsTHhbENFFFs0CLTa5Ps03ttP1jKNQ-79jYez5zfEUPG5yzDdx0g0bvY9uZ3TqwrbrbGAHIgzDEZSUaI6_0',
    pricePerDay: 1200000,
    rentalDays: 3,
    startDate: '2024-05-18',
    endDate: '2024-05-21',
    quantity: 1,
    deposit: 8000000,
    accessories: ['Pin LP-E6NH x1', 'Dây đeo'],
    condition: 'Tốt',
    available: true,
  },
  {
    id: 'LL-003',
    name: 'DJI RS 3 Pro Gimbal Stabilizer',
    brand: 'DJI',
    category: 'Phụ kiện quay',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR5LtsUHiOWqGr_xIqqyMf-gW1Sn3SN0eSNCWezt6kve0SMPHP3ervqk3CGqadyoLWnovU_fiS_4xCdbGT4cHArUbqVM-ECcNSc8N81dwzstlho9GHhttEEM8t2gujYjqNcbyqmMilxE07kzyqP3PbWrNqSGdMg43odZouqZU4iNUSTX0PHRFN3x4pAbUEz5dVR7eeOuV5I8X7TY0W8jvqwJjJloejqx93N_2T5YSxOTAMXiA9efgeiB8KgbhZPT7pBXIHg7jWNbE',
    pricePerDay: 450000,
    rentalDays: 2,
    startDate: '2024-05-16',
    endDate: '2024-05-18',
    quantity: 1,
    deposit: 3000000,
    accessories: ['Tay cầm mở rộng', 'Túi đựng'],
    condition: 'Khá',
    available: true,
  },
];

/* ────────────────────────────────────────────
   Utility helpers
   ──────────────────────────────────────────── */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
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
   Icon helper (same pattern as OverviewPage)
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
  const [items, setItems] = useState<CartItem[]>(initialCartItems);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(items.map((i) => i.id)));

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
      if (prev.size === items.length) return new Set();
      return new Set(items.map((i) => i.id));
    });
  }, [items]);

  // ── Rental days controls ──
  const updateDays = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newDays = Math.max(1, Math.min(30, item.rentalDays + delta));
        // Recalculate end date
        const start = new Date(item.startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + newDays);
        return {
          ...item,
          rentalDays: newDays,
          endDate: end.toISOString().split('T')[0],
        };
      }),
    );
  }, []);

  // ── Remove item ──
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // ── Apply coupon ──
  const handleApplyCoupon = () => {
    if (couponCode.trim().length > 0) {
      setCouponApplied(true);
    }
  };

  // ── Calculations ──
  const selectedItemsList = items.filter((i) => selectedItems.has(i.id));
  const subtotal = selectedItemsList.reduce((sum, i) => sum + i.pricePerDay * i.rentalDays * i.quantity, 0);
  const totalDeposit = selectedItemsList.reduce((sum, i) => sum + i.deposit, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const serviceFee = Math.round(subtotal * 0.05);
  const grandTotal = subtotal - discount + serviceFee;
  const totalItems = selectedItemsList.length;

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
                    checked={selectedItems.size === items.length && items.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <span>Chọn tất cả ({items.length} sản phẩm)</span>
                </label>
                {selectedItems.size > 0 && (
                  <button
                    className="cart-select-bar__remove"
                    onClick={() => {
                      setItems((prev) => prev.filter((i) => !selectedItems.has(i.id)));
                      setSelectedItems(new Set());
                    }}
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
                  <button className="cart-btn-primary cart-btn-primary--lg">
                    <Icon name="explore" />
                    Khám phá thiết bị
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {items.map((item, index) => (
                    <article
                      key={item.id}
                      className={`cart-item ${selectedItems.has(item.id) ? 'is-selected' : ''}`}
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      {/* Checkbox */}
                      <div className="cart-item__check">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </div>

                      {/* Image */}
                      <div className="cart-item__image">
                        <img src={item.imageUrl} alt={item.name} />
                        <span className={`cart-badge ${getConditionBadge(item.condition)}`}>
                          {item.condition}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="cart-item__content">
                        <div className="cart-item__top">
                          <div className="cart-item__info">
                            <span className="cart-item__category">
                              <Icon name="category" />
                              {item.category}
                            </span>
                            <h3 className="cart-item__name">{item.name}</h3>
                            <p className="cart-item__brand">
                              <Icon name="storefront" />
                              {item.brand} · Mã: {item.id}
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

                        {/* Accessories */}
                        <div className="cart-item__accessories">
                          {item.accessories.map((acc) => (
                            <span key={acc} className="cart-item__accessory-tag">
                              <Icon name="check_circle" />
                              {acc}
                            </span>
                          ))}
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
                                disabled={item.rentalDays <= 1}
                              >
                                <Icon name="remove" />
                              </button>
                              <span className="cart-item__days-value">
                                {item.rentalDays} <small>ngày</small>
                              </span>
                              <button
                                onClick={() => updateDays(item.id, 1)}
                                className="cart-item__days-btn"
                                disabled={item.rentalDays >= 30}
                              >
                                <Icon name="add" />
                              </button>
                            </div>
                            <div className="cart-item__price">
                              <span className="cart-item__price-unit">{formatCurrency(item.pricePerDay)}/ngày</span>
                              <span className="cart-item__price-total">
                                {formatCurrency(item.pricePerDay * item.rentalDays)}
                              </span>
                            </div>
                          </div>
                        </div>
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
                          {formatCurrency(item.pricePerDay * item.rentalDays)}
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
                      Phí dịch vụ
                      <button className="cart-summary-card__info-btn" title="5% phí nền tảng">
                        <Icon name="info" />
                      </button>
                    </span>
                    <span>{formatCurrency(serviceFee)}</span>
                  </div>
                  {couponApplied && (
                    <div className="cart-summary-card__row cart-summary-card__row--discount">
                      <span>
                        <Icon name="sell" />
                        Giảm giá (10%)
                      </span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="cart-summary-card__divider" />

                {/* Coupon */}
                <div className="cart-coupon">
                  <div className="cart-coupon__input-wrap">
                    <Icon name="confirmation_number" />
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        if (couponApplied) setCouponApplied(false);
                      }}
                    />
                    <button
                      className="cart-coupon__btn"
                      onClick={handleApplyCoupon}
                      disabled={couponCode.trim().length === 0}
                    >
                      Áp dụng
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="cart-coupon__success">
                      <Icon name="check_circle" />
                      Mã giảm giá đã được áp dụng thành công!
                    </p>
                  )}
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
                    <span>Tổng thanh toán</span>
                    <span className="cart-summary-card__total-value">{formatCurrency(grandTotal)}</span>
                  </div>
                  <p className="cart-summary-card__total-note">
                    (Chưa bao gồm tiền ký quỹ {formatCurrency(totalDeposit)})
                  </p>
                </div>

                {/* Checkout button */}
                <button 
                  className="cart-btn-checkout" 
                  disabled={selectedItemsList.length === 0}
                  onClick={() => navigate('/checkout')}
                >
                  <Icon name="shopping_cart_checkout" />
                  Tiến hành thanh toán
                  {selectedItemsList.length > 0 && (
                    <span className="cart-btn-checkout__amount">{formatCurrency(grandTotal + totalDeposit)}</span>
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

              {/* Quick Help */}
              <div className="cart-help-card">
                <Icon name="help" filled />
                <div>
                  <h4>Bạn cần hỗ trợ?</h4>
                  <p>Liên hệ đội ngũ LensLease để được tư vấn thuê thiết bị phù hợp.</p>
                </div>
                <button className="cart-help-card__btn">
                  <Icon name="chat" />
                  Chat ngay
                </button>
              </div>
            </aside>
          </div>
        </div>
    </div>
  );
}
