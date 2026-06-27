import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import LensRentalSchedulePanel from '../../components/scheduling/LensRentalSchedulePanel';
import ProductCard from '../../components/layout/ProductCard';
import { useSupabaseLens, useSupabaseLensById } from '../../hooks/useSupabaseLens';
import { useCart } from '../../context/CartContext';
import { ChatService } from '../../services/chat.service';
import { promotionService, PROMO_STORAGE_KEY } from '../../services/promotion.service';
import {
  calculateRentalDaysLocal,
  todayVietnamYmd,
  addDaysUtcYmd,
} from '../../utils/date-only';
import {
  platformFeeFromSubtotal,
  rentalLineSubtotal,
} from '../../utils/pricing';
import { bookingService } from '../../services/booking.service';
import {
  buildInstantCheckoutItem,
  navigateToInstantCheckout,
} from '../../utils/instant-checkout';
import { BOOKING_SCHEDULE_UI } from '../../components/scheduling/booking-schedule-labels';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lensId = (searchParams.get('lensId') || '').trim();
  const { addItem: addToCart } = useCart();

  const { product, loading, error } = useSupabaseLensById(lensId);
  const related = useSupabaseLens({
    page: 1,
    limit: 3,
    category: product?.category?.id,
    brand: product?.brand ?? undefined,
  });

  const [startDate, setStartDate] = useState(() => todayVietnamYmd());
  const [endDate, setEndDate] = useState(() => addDaysUtcYmd(todayVietnamYmd(), 3));
  const [couponInput, setCouponInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_amount: number;
    message: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [bookNowLoading, setBookNowLoading] = useState(false);
  const [cartError, setCartError] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (!lensId) return;
    setStartDate(todayVietnamYmd());
    setEndDate(addDaysUtcYmd(todayVietnamYmd(), 3));
    setAppliedPromo(null);
    setCouponInput('');
    setCouponError('');
  }, [lensId]);

  const pricePerDay = product ? Number(product.price_per_day) || 0 : 0;
  const rentalDays = calculateRentalDaysLocal(startDate, endDate);
  const subtotal = rentalLineSubtotal(pricePerDay, rentalDays, 1);
  const platformFee = platformFeeFromSubtotal(subtotal);
  const deposit = product
    ? Number((product as { required_deposit_amount?: number }).required_deposit_amount) || 0
    : 0;
  const discount = appliedPromo?.discount_amount ?? 0;
  const grandTotal = Math.max(0, subtotal + platformFee + deposit - discount);

  const productImage =
    product?.thumbnail ||
    product?.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop';

  const ownerName = product?.owner?.full_name ?? '—';
  const ownerId = product?.owner?.id ?? '';
  const locationLabel =
    product?.district && product?.city
      ? `${product.district}, ${product.city}`
      : product?.city || 'Vị trí chưa cập nhật';

  const relatedItems = useMemo(
    () => related.items.filter((item) => item.id !== lensId).slice(0, 3),
    [related.items, lensId],
  );

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }
    if (!lensId || subtotal <= 0) {
      setCouponError('Chọn ngày thuê hợp lệ trước khi áp dụng mã');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await promotionService.validate(code, subtotal, [lensId]);
      const data = res.data?.data;
      if (!data?.valid) {
        setCouponError('Mã giảm giá không hợp lệ');
        setAppliedPromo(null);
        return;
      }
      setAppliedPromo({
        code: data.code,
        discount_amount: data.discount_amount,
        message: data.message,
      });
      sessionStorage.setItem(PROMO_STORAGE_KEY, data.code);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setCouponError(msg || 'Không thể áp dụng mã giảm giá');
      setAppliedPromo(null);
      sessionStorage.removeItem(PROMO_STORAGE_KEY);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleClearCoupon = () => {
    setAppliedPromo(null);
    setCouponInput('');
    setCouponError('');
    sessionStorage.removeItem(PROMO_STORAGE_KEY);
  };

  const handleAddToCart = async () => {
    if (!product || !lensId) return;
    setCartLoading(true);
    setCartError('');
    try {
      await addToCart({
        lens_id: lensId,
        start_date: startDate,
        end_date: endDate,
        quantity: 1,
        lens: {
          title: product.title,
          image_url: productImage,
          brand: product.brand ?? undefined,
          category_name: product.category?.name,
          owner_name: ownerName,
          required_deposit_amount: deposit,
        },
      });
      if (appliedPromo?.code) {
        sessionStorage.setItem(PROMO_STORAGE_KEY, appliedPromo.code);
      }
      navigate('/cart');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setCartError(msg || (err instanceof Error ? err.message : 'Không thể thêm vào giỏ'));
    } finally {
      setCartLoading(false);
    }
  };

  const handleBookNow = async () => {
    if (!product || !lensId) return;
    const sy = startDate.split('T')[0];
    const ey = endDate.split('T')[0];
    if (!sy || !ey || sy >= ey) {
      setCartError(BOOKING_SCHEDULE_UI.errEndMustBeAfterStart);
      return;
    }

    setBookNowLoading(true);
    setCartError('');
    try {
      const availRes = await bookingService.checkAvailability(lensId, {
        start_date: sy,
        end_date: ey,
        quantity: 1,
      });
      const avail = (availRes.data?.data ?? availRes.data) as {
        is_available?: boolean;
        available_quantity?: number;
      };
      if (avail && avail.is_available === false) {
        setCartError(BOOKING_SCHEDULE_UI.notEnoughSlots(avail.available_quantity ?? 0));
        return;
      }

      const allowedTypes = Array.isArray(
        (product as { allowed_deposit_types?: string[] }).allowed_deposit_types,
      )
        ? [...(product as { allowed_deposit_types: string[] }).allowed_deposit_types]
        : undefined;

      const item = buildInstantCheckoutItem({
        lensId,
        title: product.title,
        imageUrl: productImage,
        ownerName,
        ownerRating:
          product.owner && 'rating_avg' in product.owner
            ? Number((product.owner as { rating_avg?: number }).rating_avg)
            : undefined,
        startDate: sy,
        endDate: ey,
        pricePerDay,
        deposit,
        allowedDepositTypes: allowedTypes,
      });

      if (appliedPromo?.code) {
        sessionStorage.setItem(PROMO_STORAGE_KEY, appliedPromo.code);
      }

      await navigateToInstantCheckout(navigate, [item]);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setCartError(msg || (err instanceof Error ? err.message : BOOKING_SCHEDULE_UI.errCheckFailed));
    } finally {
      setBookNowLoading(false);
    }
  };

  const handleChat = async () => {
    if (!ownerId) return;
    setChatLoading(true);
    try {
      const conversation = await ChatService.getOrCreateConversation(ownerId);
      navigate(`/chat?conversation_id=${conversation.id}`);
    } catch {
      setCartError('Không thể mở chat. Vui lòng thử lại.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans">
      <main className="mx-auto max-w-7xl p-6">
        <div className="grid grid-cols-12 gap-5">
          {/* LEFT — thông tin sản phẩm thật */}
          <div className="col-span-12 flex flex-col gap-4 lg:col-span-3">
            {!lensId ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                Chọn sản phẩm để xem thông tin và đặt lịch.
              </div>
            ) : loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
                Đang tải sản phẩm…
              </div>
            ) : error || !product ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error?.message || 'Không tải được sản phẩm.'}
                <Link to="/products" className="mt-3 block font-semibold text-blue-700 underline">
                  Quay lại danh sách
                </Link>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 rounded-xl bg-slate-100 p-4">
                    <img
                      src={productImage}
                      className="h-40 w-full rounded-lg object-cover"
                      alt={product.title}
                    />
                  </div>
                  {product.category?.name && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {product.category.name}
                    </span>
                  )}
                  <h3 className="mt-3 text-xl font-bold text-slate-800">{product.title}</h3>
                  {product.brand && (
                    <div className="mt-1 text-sm font-semibold text-slate-600">{product.brand}</div>
                  )}
                  <div className="mt-4 text-2xl font-extrabold text-slate-900">
                    {formatPrice(pricePerDay)}
                    <span className="ml-1 text-sm font-medium text-slate-500">/ ngày</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                      {ownerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{ownerName}</h4>
                      <div className="text-xs text-slate-500">CHỦ CHO THUÊ</div>
                      {product.rating_avg != null && (
                        <div className="mt-1 text-sm font-semibold text-yellow-500">
                          ★ {Number(product.rating_avg).toFixed(1)}
                          {product.review_count != null && (
                            <span className="ml-1 font-normal text-slate-500">
                              ({product.review_count} đánh giá)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleChat()}
                    disabled={!ownerId || chatLoading}
                    className="mt-4 w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {chatLoading ? 'Đang mở chat…' : 'Liên hệ'}
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 text-xs font-bold text-slate-500">ĐỊA ĐIỂM NHẬN MÁY</div>
                  <div className="font-semibold text-slate-800">{locationLabel}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    Xem địa chỉ chính xác sau khi đặt lịch
                  </div>
                </div>
              </>
            )}
          </div>

          {/* CENTER — lịch thuê */}
          <div className="col-span-12 flex flex-col gap-4 lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800">Đặt lịch thuê</h3>
              {!lensId ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="mb-3">Chưa có mã thiết bị trong URL.</p>
                  <Link
                    to="/products"
                    className="inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                  >
                    Chọn sản phẩm &amp; đặt lịch
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <LensRentalSchedulePanel
                    lensId={lensId}
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    productDetailHref={`/products/${lensId}`}
                    variant="default"
                  />
                    <button
                      type="button"
                      onClick={() => void handleBookNow()}
                      disabled={!product || bookNowLoading || cartLoading}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {bookNowLoading ? BOOKING_SCHEDULE_UI.processing : BOOKING_SCHEDULE_UI.bookNow}
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/products/${lensId}`}
                        className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 py-3 text-center text-sm font-bold text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Mở trang sản phẩm
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleAddToCart()}
                        disabled={!product || cartLoading || bookNowLoading}
                        className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-blue-600 py-3 text-center text-sm font-bold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                      >
                        {cartLoading ? 'Đang thêm…' : 'Thêm vào giỏ hàng'}
                      </button>
                    </div>
                  {cartError && (
                    <p className="text-sm text-red-600">{cartError}</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="mb-3 font-bold text-slate-800">Chính sách huỷ</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>Miễn phí huỷ khi đơn còn PENDING</li>
                  <li>Huỷ sau khi chủ xác nhận có thể hoàn cọc theo quy định</li>
                  <li>Liên hệ hỗ trợ nếu cần đổi lịch</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="mb-3 font-bold text-slate-800">Yêu cầu thuê</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>Đăng nhập tài khoản LensLease</li>
                  <li>Đặt cọc qua ví nền tảng (nếu áp dụng)</li>
                  <li>Số dư ví đủ khi chủ xác nhận đơn</li>
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT — tóm tắt chi phí thật */}
          <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-5 text-lg font-bold text-slate-800">Tóm tắt chi phí</h3>

              {!product || !lensId ? (
                <p className="text-sm text-slate-500">Chọn sản phẩm để xem chi phí ước tính.</p>
              ) : (
                <>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        {formatPrice(pricePerDay)} × {rentalDays} ngày
                      </span>
                      <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phí nền tảng (8%)</span>
                      <span className="font-semibold">{formatPrice(platformFee)}</span>
                    </div>
                    {deposit > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tiền cọc (ước tính)</span>
                        <span className="font-semibold">{formatPrice(deposit)}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Giảm giá ({appliedPromo?.code})</span>
                        <span className="font-semibold">−{formatPrice(discount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 font-semibold text-slate-700">Nhập mã giảm giá</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Nhập mã giảm giá"
                        disabled={!!appliedPromo}
                        className="flex-1 rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-50"
                      />
                      {appliedPromo ? (
                        <button
                          type="button"
                          onClick={handleClearCoupon}
                          className="rounded-lg border border-slate-200 px-4 font-semibold hover:bg-slate-50"
                        >
                          Bỏ
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleApplyCoupon()}
                          disabled={couponLoading}
                          className="rounded-lg bg-slate-100 px-4 font-semibold hover:bg-slate-200 disabled:opacity-50"
                        >
                          {couponLoading ? '…' : 'Áp dụng'}
                        </button>
                      )}
                    </div>
                    {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}
                    {appliedPromo?.message && (
                      <p className="mt-2 text-xs text-emerald-700">{appliedPromo.message}</p>
                    )}
                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="font-bold text-slate-800">Tổng ước tính</div>
                        <div className="text-sm text-slate-500">
                          Bao gồm phí nền tảng{deposit > 0 ? ' và cọc' : ''}
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {formatPrice(grandTotal)}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <Link
                        to="/cart"
                        className="flex items-center justify-center rounded-xl border border-slate-300 py-4 text-lg font-bold text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Giỏ hàng
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleBookNow()}
                        disabled={!product || bookNowLoading || cartLoading}
                        className="flex items-center justify-center rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {bookNowLoading ? BOOKING_SCHEDULE_UI.processing : BOOKING_SCHEDULE_UI.bookNow}
                      </button>
                    </div>
                    <div className="mt-3 text-center text-xs text-slate-500">
                      Tiền chỉ bị trừ khi chủ thuê xác nhận đơn
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sản phẩm liên quan thay cho addon giả */}
            {relatedItems.length > 0 && (
              <div>
                <h3 className="mb-3 font-bold text-slate-800">Sản phẩm liên quan</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {relatedItems.map((item) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
