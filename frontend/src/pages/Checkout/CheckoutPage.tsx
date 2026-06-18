import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import { walletService } from '../../services/wallet.service';
import { ekycService } from '../../services/ekyc.service';
import { getAuthToken } from '../../utils/auth';
import { platformFeeFromSubtotal, rentalLineSubtotal } from '../../utils/pricing';
import LensRentalSchedulePanel from '../../components/scheduling/LensRentalSchedulePanel';
import { PromotionPicker } from '../../components/promotion/PromotionPicker';
import {
  type AppliedPromotion,
  getStoredPromotionCode,
  setStoredPromotionCode,
} from '../../services/promotion.service';
import { isRealCartItemId } from '../../utils/instant-checkout';
import { paymentService, type TopupChannel } from '../../services/payment.service';
import { redirectBookingGroupPayment } from '../../utils/booking-group-payment';
import type { CheckoutSuccessPayload } from './SuccessPage';

type CheckoutPayChannel = TopupChannel | 'WALLET';

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

type CheckoutItem = {
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
  /** Theo `LensListing.allowed_deposit_types` — giao nhau giữa các dòng trong giỏ. */
  allowedDepositTypes: string[];
};

const DEPOSIT_ORDER = ['MONEY_PLATFORM', 'MONEY_DIRECT', 'PAPERWORK'] as const;
type DepositTypeStr = (typeof DEPOSIT_ORDER)[number];

const DEPOSIT_LABELS: Record<DepositTypeStr, string> = {
  MONEY_PLATFORM: 'Cọc qua ví nền tảng (ký quỹ)',
  MONEY_DIRECT: 'Cọc trực tiếp cho chủ máy (không giữ trên ví)',
  PAPERWORK: 'Cọc giấy tờ (CCCD / hộ chiếu…)',
};

function intersectDepositTypes(items: CheckoutItem[]): DepositTypeStr[] {
  if (!items.length) return [...DEPOSIT_ORDER];
  return DEPOSIT_ORDER.filter((t) => items.every((it) => it.allowedDepositTypes.includes(t)));
}

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedItems: CheckoutItem[] = location.state?.selectedItems || [];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [depositType, setDepositType] = useState<DepositTypeStr>('MONEY_PLATFORM');
  const [deliveryMethod, setDeliveryMethod] = useState<'SELF_PICKUP' | 'DELIVERY'>('SELF_PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [depositNote, setDepositNote] = useState('');

  const [walletAvailable, setWalletAvailable] = useState<number | null>(null);
  const [kycChecking, setKycChecking] = useState(true);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromotion | null>(null);
  const [vnpayOn, setVnpayOn] = useState(false);
  const [momoOn, setMomoOn] = useState(false);
  const [payChannel, setPayChannel] = useState<CheckoutPayChannel>('VNPAY');
  const [redirectingPay, setRedirectingPay] = useState(false);

  const allowedDeposits = useMemo(() => intersectDepositTypes(selectedItems), [selectedItems]);

  /** Chưa đăng nhập: không hiển thị checkout — về login. Đã login nhưng mất state đơn: về giỏ. */
  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login', { replace: true, state: { cartReturn: true } });
      return;
    }
    if (selectedItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [navigate, selectedItems.length]);

  useEffect(() => {
    if (!getAuthToken() || selectedItems.length === 0) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await ekycService.getStatus();
        if (!cancelled && !res.data?.is_verified) {
          navigate('/Verification', { replace: true, state: { selectedItems } });
        }
      } catch {
        if (!cancelled) {
          navigate('/Verification', { replace: true, state: { selectedItems } });
        }
      } finally {
        if (!cancelled) setKycChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, selectedItems]);

  useEffect(() => {
    if (!allowedDeposits.includes(depositType)) {
      setDepositType(allowedDeposits[0] ?? 'MONEY_PLATFORM');
    }
  }, [allowedDeposits, depositType]);

  useEffect(() => {
    if (!getAuthToken() || selectedItems.length === 0) {
      setWalletAvailable(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await walletService.getBalance();
        const data = (res.data as { data?: { available_balance?: string | number } })?.data;
        const n = data?.available_balance != null ? Number(data.available_balance) : 0;
        if (!cancelled) setWalletAvailable(Number.isFinite(n) ? n : 0);
      } catch {
        if (!cancelled) setWalletAvailable(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedItems.length]);

  useEffect(() => {
    void paymentService
      .getGatewayConfig()
      .then((r) => {
        const v = !!r.data?.data?.vnpay;
        const m = !!r.data?.data?.momo;
        setVnpayOn(v);
        setMomoOn(m);
        if (v) setPayChannel('VNPAY');
        else if (m) setPayChannel('MOMO');
        else setPayChannel('WALLET');
      })
      .catch(() => {
        setVnpayOn(false);
        setMomoOn(false);
        setPayChannel('WALLET');
      });
  }, []);

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

  const subtotal = selectedItems.reduce(
    (sum, i) => sum + rentalLineSubtotal(i.pricePerDay, i.rentalDays, i.quantity),
    0,
  );
  const platformFeeTotal = selectedItems.reduce(
    (sum, i) =>
      sum + platformFeeFromSubtotal(rentalLineSubtotal(i.pricePerDay, i.rentalDays, i.quantity)),
    0,
  );
  const totalDeposit = selectedItems.reduce((sum, i) => sum + i.deposit * i.quantity, 0);
  const discount = appliedPromo?.discount_amount ?? 0;
  const rentalPlusPlatform = Math.max(0, subtotal + platformFeeTotal - discount);
  const lensIds = useMemo(() => selectedItems.map((i) => i.lensId), [selectedItems]);
  /** Khớp backend `chargeRenterOnConfirm`: chỉ cộng cọc vào trừ ví khi MONEY_PLATFORM. */
  const totalDepositWallet = depositType === 'MONEY_PLATFORM' ? totalDeposit : 0;
  const totalWhenOwnersConfirm = rentalPlusPlatform + totalDepositWallet;

  const walletShort =
    walletAvailable != null && walletAvailable < totalWhenOwnersConfirm
      ? totalWhenOwnersConfirm - walletAvailable
      : 0;

  const onlineGatewayOn = vnpayOn || momoOn;
  const usesOnlinePay = payChannel === 'VNPAY' || payChannel === 'MOMO';

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Vui lòng đăng nhập để đặt thuê.');
      }

      if (deliveryMethod === 'DELIVERY' && !deliveryAddress.trim()) {
        throw new Error('Vui lòng nhập địa chỉ giao hàng.');
      }

      if (depositType === 'PAPERWORK' && !depositNote.trim()) {
        throw new Error('Vui lòng ghi chú loại giấy tờ / tài sản cọc (ví dụ: CCCD số…).');
      }

      if (usesOnlinePay) {
        if (payChannel === 'VNPAY' && !vnpayOn) {
          throw new Error('VNPay chưa được cấu hình trên server.');
        }
        if (payChannel === 'MOMO' && !momoOn) {
          throw new Error('MoMo chưa được cấu hình trên server.');
        }
      } else if (walletShort > 0 && !onlineGatewayOn) {
        throw new Error(
          `Ví thiếu khoảng ${formatPrice(walletShort)}đ và chưa bật cổng thanh toán online. Vui lòng nạp ví trước.`,
        );
      }

      const items = selectedItems.map((item) => ({
        lens_id: item.lensId,
        start_date: item.startDate,
        end_date: item.endDate,
        quantity: item.quantity,
        selected_deposit_type: depositType,
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === 'DELIVERY' ? deliveryAddress.trim() : undefined,
        deposit_note: depositType === 'PAPERWORK' ? depositNote.trim() : undefined,
      }));

      const cartIds = selectedItems.map((i) => i.id).filter(isRealCartItemId);
      const promotionCode =
        appliedPromo?.code?.trim() || getStoredPromotionCode() || undefined;

      const res = await bookingService.checkoutGroup({
        items,
        cart_item_ids: cartIds.length ? cartIds : undefined,
        promotion_code: promotionCode,
      });

      if (promotionCode) {
        setStoredPromotionCode(null);
        setAppliedPromo(null);
      }

      const payload = (res.data as { data?: CheckoutSuccessPayload })?.data;
      const groupId = payload?.booking_group_id;

      if (usesOnlinePay && groupId) {
        setRedirectingPay(true);
        try {
          await redirectBookingGroupPayment(groupId, payChannel);
          return;
        } catch (payErr: unknown) {
          const payMsg =
            payErr && typeof payErr === 'object' && 'response' in payErr
              ? (payErr as { response?: { data?: { message?: string } } }).response?.data?.message
              : undefined;
          navigate('/success', {
            replace: true,
            state: {
              checkout: payload,
              paymentError: payMsg || (payErr instanceof Error ? payErr.message : 'Không mở được cổng thanh toán'),
            },
          });
          return;
        }
      }

      navigate('/success', { replace: true, state: { checkout: payload } });
    } catch (err: unknown) {
      console.error(err);
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || (err instanceof Error ? err.message : 'Lỗi khi tạo đơn thuê'));
      setRedirectingPay(false);
    } finally {
      setLoading(false);
    }
  };

  if (!getAuthToken()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fa] text-sm text-gray-500">
        Đang chuyển đến đăng nhập…
      </div>
    );
  }

  if (selectedItems.length === 0) return null;

  if (kycChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fa] text-sm text-gray-500">
        Đang kiểm tra eKYC…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-gray-800 antialiased">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mx-auto mb-10 flex w-full max-w-3xl items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b45b3] text-white">
              ✓
            </div>
            <span className="text-sm font-medium text-gray-800">Giỏ hàng</span>
          </div>
          <div className="mx-4 mt-[-20px] h-px flex-1 bg-gray-300" />
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b45b3] text-white shadow-md shadow-blue-200 font-bold">
              2
            </div>
            <span className="text-sm font-bold text-[#0b45b3]">Xác nhận đặt thuê</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                Sản phẩm thuê
              </h2>

              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-24 w-24 rounded-lg border border-gray-200 bg-white object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Chủ sở hữu:{' '}
                        <span className="font-medium text-blue-600">{item.ownerName}</span>
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        SL: <span className="font-semibold">{item.quantity}</span>
                      </p>
                      <div className="mt-1 flex items-center text-xs font-medium text-gray-600">
                        <span className="mr-1 text-yellow-400">★</span>
                        {item.ownerRating ?? '—'}
                      </div>
                    </div>
                    <div className="text-right sm:border-l sm:border-gray-200 sm:pl-4">
                      <p className="mb-1 text-xs font-medium text-gray-500">Thời gian thuê</p>
                      <p className="text-sm font-bold text-gray-900">
                        {item.startDate.split('-').reverse().join('/')} -{' '}
                        {item.endDate.split('-').reverse().join('/')}
                      </p>
                      <p className="mt-1 text-xs text-blue-600">{item.rentalDays} ngày</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <LensRentalSchedulePanel
                      lensId={item.lensId}
                      startDate={item.startDate}
                      endDate={item.endDate}
                      quantity={item.quantity}
                      productDetailHref={`/products/${item.lensId}`}
                      variant="compact"
                      collapsible
                      defaultOpen={false}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-6 text-lg font-bold text-gray-900">Hình thức cọc & giao nhận</h2>
              
              {/* PHẦN 1: ĐẶT CỌC */}
              <div className="mb-8">
                <label className="mb-3 block text-sm font-bold text-gray-700">
                  1. Hình thức đặt cọc
                </label>
                <div className="space-y-3">
                  {allowedDeposits.map((type) => {
                    const selected = depositType === type;
                    const isPlatform = type === 'MONEY_PLATFORM';
                    return (
                      <label
                        key={type}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-all ${
                          selected
                            ? 'border-[#0b45b3] bg-blue-50/50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="depositType"
                          checked={selected}
                          onChange={() => setDepositType(type)}
                          className="mt-1 h-4 w-4 text-[#0b45b3]"
                        />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 font-bold text-gray-900">
                            {DEPOSIT_LABELS[type]}
                            {isPlatform && (
                              <span className="flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">
                                <Icon name="verified_user" /> Khuyến nghị
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-600">
                            {type === 'MONEY_PLATFORM' &&
                              'Tiền cọc được LensLease giữ an toàn và hoàn trả khi hoàn tất đơn thuê.'}
                            {type === 'MONEY_DIRECT' &&
                              'Bạn chuyển cọc trực tiếp cho chủ máy khi giao nhận — không giữ trên ví nền tảng.'}
                            {type === 'PAPERWORK' &&
                              'Giữ giấy tờ tùy thân (CCCD/hộ chiếu) hoặc tài sản có giá theo thỏa thuận với chủ máy.'}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                  {allowedDeposits.length === 0 && (
                    <p className="text-sm text-amber-700">
                      Không có hình thức cọc chung cho tất cả sản phẩm trong giỏ. Vui lòng tách đơn.
                    </p>
                  )}
                </div>
                {depositType === 'PAPERWORK' && (
                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-semibold text-gray-700">
                      Ghi chú giấy tờ / tài sản cọc
                    </label>
                    <textarea
                      value={depositNote}
                      onChange={(e) => setDepositNote(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Ví dụ: CCCD số 079…, hoặc thẻ tín dụng ký gửi"
                    />
                  </div>
                )}
              </div>

              {/* PHẦN 2: GIAO NHẬN */}
              <div>
                <label className="mb-3 block text-sm font-bold text-gray-700">2. Phương thức nhận máy</label>
                <div className="space-y-3">
                  <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition-all ${
                    deliveryMethod === 'SELF_PICKUP' ? 'border-[#0b45b3] bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === 'SELF_PICKUP'}
                      onChange={() => setDeliveryMethod('SELF_PICKUP')}
                      className="h-4 w-4 text-[#0b45b3]"
                    />
                    <span className="font-semibold text-gray-900">Tự đến lấy / trả máy</span>
                  </label>

                  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-all ${
                    deliveryMethod === 'DELIVERY' ? 'border-[#0b45b3] bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="delivery"
                      className="mt-1 h-4 w-4 text-[#0b45b3]"
                      checked={deliveryMethod === 'DELIVERY'}
                      onChange={() => setDeliveryMethod('DELIVERY')}
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">Giao tận nơi</span>
                      <p className="mt-1 text-xs text-gray-500 italic">Phí giao hàng sẽ được thỏa thuận trực tiếp với chủ máy.</p>
                      {deliveryMethod === 'DELIVERY' && (
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-sm"
                          placeholder="Địa chỉ nhận máy"
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Mã khuyến mãi</h2>
              <PromotionPicker
                subtotal={subtotal}
                lensIds={lensIds}
                appliedPromo={appliedPromo}
                onChange={setAppliedPromo}
                variant="checkout"
              />
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-2 text-lg font-bold text-gray-900">Thanh toán</h2>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">
                Sau khi tạo đơn, bạn có thể{' '}
                <strong>thanh toán ngay qua cổng online</strong> (tiền vào ví ký quỹ + đánh dấu nhóm đã thanh toán).
                Khi chủ duyệt, hệ thống trừ ví theo từng đơn (tiền thuê + phí sàn 8%
                {depositType === 'MONEY_PLATFORM' ? ' + ký quỹ nền tảng' : ''}).
              </p>

              {onlineGatewayOn ? (
                <div className="space-y-3">
                  {vnpayOn && (
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition-all ${
                        payChannel === 'VNPAY'
                          ? 'border-[#0e4194] bg-blue-50/60 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payChannel"
                        checked={payChannel === 'VNPAY'}
                        onChange={() => setPayChannel('VNPAY')}
                        className="h-4 w-4 text-[#0e4194]"
                      />
                      <span className="font-semibold text-gray-900">VNPay — thanh toán ngay sau khi gửi đơn</span>
                    </label>
                  )}
                  {momoOn && (
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition-all ${
                        payChannel === 'MOMO'
                          ? 'border-[#a50064] bg-pink-50/50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payChannel"
                        checked={payChannel === 'MOMO'}
                        onChange={() => setPayChannel('MOMO')}
                        className="h-4 w-4 text-[#a50064]"
                      />
                      <span className="font-semibold text-gray-900">MoMo — thanh toán ngay sau khi gửi đơn</span>
                    </label>
                  )}
                  {walletShort === 0 && (
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition-all ${
                        payChannel === 'WALLET'
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payChannel"
                        checked={payChannel === 'WALLET'}
                        onChange={() => setPayChannel('WALLET')}
                        className="h-4 w-4 text-emerald-600"
                      />
                      <span className="font-semibold text-gray-900">
                        Dùng số dư ví hiện có ({formatPrice(walletAvailable ?? 0)}đ)
                      </span>
                    </label>
                  )}
                </div>
              ) : (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Cổng VNPay/MoMo chưa bật trên server. Đơn vẫn được tạo; hãy{' '}
                  <Link to="/wallet" className="font-semibold underline">
                    nạp ví
                  </Link>{' '}
                  trước khi chủ duyệt.
                </p>
              )}

              <p className="mt-3 text-sm">
                <Link to="/wallet" className="font-semibold text-[#0b45b3] underline">
                  Mở ví ký quỹ
                </Link>{' '}
                để xem số dư và lịch sử giao dịch.
              </p>
            </div>

            {walletShort > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Số dư khả dụng hiện tại ({formatPrice(walletAvailable ?? 0)}đ) thấp hơn dự kiến cần khi các chủ
                duyệt ({formatPrice(totalWhenOwnersConfirm)}đ). Bạn còn thiếu khoảng{' '}
                <strong>{formatPrice(walletShort)}đ</strong> — nên nạp ví trước để tránh lỗi khi duyệt đơn.
              </div>
            )}

            {error && <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700">{error}</div>}

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="flex items-center gap-2 font-medium text-gray-500 transition hover:text-gray-800"
              >
                ← Quay lại giỏ hàng
              </button>

              <button
                type="button"
                onClick={() => void handleCheckout()}
                disabled={loading || redirectingPay}
                className={`inline-flex items-center justify-center rounded-xl px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition ${loading || redirectingPay ? 'cursor-not-allowed bg-gray-400' : 'bg-[#0b45b3] hover:bg-blue-800'}`}
              >
                {redirectingPay
                  ? 'Đang chuyển tới cổng thanh toán…'
                  : loading
                    ? 'Đang tạo đơn...'
                    : usesOnlinePay
                      ? 'Gửi yêu cầu & thanh toán ngay'
                      : 'Gửi yêu cầu thuê'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-gray-900">
                Tóm tắt ({selectedItems.length} thiết bị)
              </h3>

              <div className="mb-6 space-y-3 border-b border-gray-100 pb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiền thuê (gốc)</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}đ</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Phí sàn (8% / dòng)</span>
                  <span className="font-medium text-gray-900">{formatPrice(platformFeeTotal)}đ</span>
                </div>

                {discount > 0 && appliedPromo && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Giảm giá ({appliedPromo.code})</span>
                    <span className="font-semibold">−{formatPrice(discount)}đ</span>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <span className="font-bold text-gray-600">Giá trị cọc (theo thiết bị)</span>
                  <span className="font-bold text-gray-900">{formatPrice(totalDeposit)}đ</span>
                </div>
                {depositType !== 'MONEY_PLATFORM' && (
                  <p className="text-xs text-gray-500">
                    Với hình thức cọc đã chọn, số tiền cọc này không bị trừ qua ví nền tảng khi chủ duyệt (theo
                    logic hiện tại của backend).
                  </p>
                )}
              </div>

              <div className="mb-6 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Dự kiến trừ ví khi các chủ duyệt</span>
                </div>
                <div className="text-right text-2xl font-extrabold text-[#0b45b3]">
                  {formatPrice(totalWhenOwnersConfirm)}đ
                </div>
                <p className="text-right text-xs text-gray-500">
                  = {formatPrice(rentalPlusPlatform)}đ (thuê + phí sàn
                  {discount > 0 ? ` − ${formatPrice(discount)}đ KM` : ''})
                  {totalDepositWallet > 0
                    ? ` + ${formatPrice(totalDepositWallet)}đ (ký quỹ qua ví)`
                    : ' (không cọc qua ví nền tảng)'}
                </p>
              </div>

              {walletAvailable != null && (
                <p className="mb-4 text-center text-xs text-gray-600">
                  Số dư ví khả dụng: <strong>{formatPrice(walletAvailable)}đ</strong>
                </p>
              )}

              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <span className="text-blue-600">🛡</span>
                <p className="text-[11px] leading-relaxed text-blue-900">
                  <span className="font-bold">Lưu ý:</span> Chưa trừ ví ở bước này. Đảm bảo ví đủ số dư khi chủ máy
                  bắt đầu duyệt đơn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
