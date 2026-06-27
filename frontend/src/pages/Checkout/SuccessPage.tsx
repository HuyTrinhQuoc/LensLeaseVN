import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BookingGroupVnpayButton from '../../components/wallet/BookingGroupVnpayButton';
import { paymentService } from '../../services/payment.service';
import { getAuthToken } from '../../utils/auth';

type SuccessBooking = {
  id: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  items?: Array<{
    lens?: { title?: string; images?: Array<{ image_url?: string }> };
  }>;
  owner?: { full_name?: string };
};

export type CheckoutSuccessPayload = {
  booking_group_id?: string;
  booking_group_status?: string;
  total_amount?: number;
  bookings?: SuccessBooking[];
};

function formatShortId(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function formatDateVi(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
}

export default function BookingSuccessPage() {
  const location = useLocation();
  const checkout = location.state?.checkout as CheckoutSuccessPayload | undefined;
  const paymentError = (location.state as { paymentError?: string } | null)?.paymentError;

  const groupId = checkout?.booking_group_id;
  const bookings = checkout?.bookings ?? [];
  const totalAmount = checkout?.total_amount;
  const groupStatus = checkout?.booking_group_status;

  const [vnpayOn, setVnpayOn] = useState(false);

  useEffect(() => {
    void paymentService
      .getGatewayConfig()
      .then((r) => setVnpayOn(!!r.data?.data?.vnpay))
      .catch(() => setVnpayOn(false));
  }, []);

  const canVnpayPrepay =
    Boolean(getAuthToken()) &&
    Boolean(groupId) &&
    vnpayOn &&
    (groupStatus === 'PENDING' || groupStatus === undefined);

  const first = bookings[0];
  const firstLens = first?.items?.[0]?.lens;
  const thumb =
    firstLens?.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-gray-800">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="text-xl font-extrabold text-[#0b45b3]">LensLease VN</div>
            <div className="hidden h-6 w-px bg-gray-200 md:block" />
            <div className="hidden text-sm font-medium text-gray-500 md:block">Đặt thuê</div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            Giao dịch nội bộ an toàn
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-200">
              <span className="material-symbols-outlined text-[40px]">check</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            <span className="material-symbols-outlined text-[18px]">task_alt</span>
            Đã tạo yêu cầu thuê
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900">Đặt thuê thành công</h1>

          {paymentError ? (
            <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Đơn đã được tạo nhưng chưa chuyển được sang cổng thanh toán: <strong>{paymentError}</strong>. Bạn
              có thể thử lại bên dưới.
            </div>
          ) : null}

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500">
            Đơn của bạn đang <strong>chờ chủ thiết bị xác nhận</strong>. Tiền trong ví sẽ{' '}
            <strong>chỉ bị trừ khi họ duyệt</strong> từng đơn (tiền thuê + phí sàn + ký quỹ nền tảng theo cài đặt).
            Bạn có thể theo dõi trong mục Đơn thuê.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 border-b border-gray-100 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">
                {groupId ? 'Mã nhóm đơn (Booking group)' : 'Mã đơn'}
              </div>
              <div className="mt-1 text-2xl font-extrabold text-[#0b45b3]">
                {groupId ? `#${formatShortId(groupId)}` : '—'}
              </div>
              {typeof totalAmount === 'number' ? (
                <p className="mt-2 text-sm text-gray-600">
                  Tổng cần trên ví khi các chủ duyệt (thuê + phí sàn + cọc nền tảng nếu có):{' '}
                  <strong>{new Intl.NumberFormat('vi-VN').format(totalAmount)}đ</strong>
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl bg-blue-50 px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">Trạng thái</div>
              <div className="mt-1 flex items-center gap-2 text-sm font-bold text-blue-900">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Chờ chủ thiết bị xác nhận
              </div>
            </div>
          </div>

          {first ? (
            <div className="flex flex-col gap-5 border-b border-gray-100 py-6 md:flex-row">
              <img src={thumb} alt="" className="h-28 w-full rounded-2xl object-cover md:w-40" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{firstLens?.title ?? 'Thiết bị'}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>
                    Chủ thiết bị:{' '}
                    <span className="font-semibold text-[#0b45b3]">{first?.owner?.full_name ?? '—'}</span>
                  </span>
                  <span>•</span>
                  <span>
                    {formatDateVi(first.start_date)} → {formatDateVi(first.end_date)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {bookings.length > 1 ? (
            <div className="border-b border-gray-100 py-4">
              <p className="mb-2 text-sm font-semibold text-gray-700">Các đơn con ({bookings.length})</p>
              <ul className="space-y-2 text-sm text-gray-600">
                {bookings.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span>Đơn #{formatShortId(b.id)}</span>
                    <Link className="font-medium text-[#0b45b3] hover:underline" to={`/bookings/${b.id}`}>
                      Xem chi tiết
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : first ? (
            <div className="border-b border-gray-100 py-4 text-sm">
              <Link className="font-semibold text-[#0b45b3] hover:underline" to={`/bookings/${first.id}`}>
                Xem chi tiết đơn →
              </Link>
            </div>
          ) : null}

          <div className="space-y-2 py-6 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Thời điểm</span>
              <span className="font-semibold text-gray-900">{new Date().toLocaleString('vi-VN')}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <span className="material-symbols-outlined">info</span>
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Tiếp theo?</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-blue-900">
                  <li>• Chủ thiết bị duyệt hoặc từ chối từng đơn.</li>
                  <li>• Khi được duyệt, hệ thống trừ ví theo từng đơn.</li>
                  <li>• Kiểm tra số dư tại trang Ví ký quỹ trước khi chủ bắt đầu duyệt.</li>
                  {groupId && vnpayOn ? (
                    <li>
                      • Hoặc <strong>thanh toán VNPay ngay</strong> để đưa đủ tiền vào ví và đánh dấu nhóm đã thanh
                      toán online (khuyến nghị nếu ví đang thiếu).
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </div>

          {canVnpayPrepay && groupId ? (
            <div className="mt-6">
              <BookingGroupVnpayButton groupId={groupId} />
            </div>
          ) : null}

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              to="/history"
              className="flex items-center justify-center rounded-2xl border border-gray-300 py-4 text-lg font-bold text-gray-700 transition hover:border-[#0b45b3] hover:bg-blue-50 hover:text-[#0b45b3]"
            >
              Xem đơn thuê
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center rounded-2xl bg-[#0b45b3] py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800"
            >
              Về trang chủ
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Cần hỗ trợ? Liên hệ <span className="font-semibold text-[#0b45b3]">support@lenslease.vn</span>
        </div>
      </main>
    </div>
  );
}
