import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LensRentalSchedulePanel from '../../components/scheduling/LensRentalSchedulePanel';
import BookingGroupVnpayButton from '../../components/wallet/BookingGroupVnpayButton';
import Pagination from '../../components/common/Pagination';
import { bookingService } from '../../services/booking.service';
import { paymentService } from '../../services/payment.service';
import { getAuthToken } from '../../utils/auth';

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Đang chờ xác nhận',
  CONFIRMED: 'Đã duyệt',
  ACTIVE: 'Đang thuê',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Bị từ chối',
  OVERDUE: 'Quá hạn',
};

const statusStyles: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  CONFIRMED: { bg: 'bg-sky-100', text: 'text-sky-800' },
  ACTIVE: { bg: 'bg-blue-100', text: 'text-blue-700' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-700' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-600' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700' },
  OVERDUE: { bg: 'bg-orange-100', text: 'text-orange-800' },
};

type BookingRow = {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  total_price: number | string;
  booking_group_id?: string;
  booking_group?: { id: string; status: string };
  owner?: { full_name?: string };
  items?: Array<{
    lens_id?: string;
    quantity?: number;
    lens?: {
      id?: string;
      title?: string;
      thumbnail?: string;
      images?: Array<{ image_url?: string; url?: string }>;
    };
  }>;
};

function formatPrice(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function lensImage(b: BookingRow): string {
  const lens = b.items?.[0]?.lens;
  if (!lens) return 'https://placehold.co/600x400/e2e8f0/64748b?text=Lens';
  if (lens.thumbnail) return lens.thumbnail;
  const img = lens.images?.[0];
  return img?.image_url || img?.url || 'https://placehold.co/600x400/e2e8f0/64748b?text=Lens';
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [vnpayOn, setVnpayOn] = useState(false);

  useEffect(() => {
    void paymentService
      .getGatewayConfig()
      .then((r) => setVnpayOn(!!r.data?.data?.vnpay))
      .catch(() => setVnpayOn(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const retryGroupIds = useMemo(() => {
    const ids = new Set<string>();
    for (const b of bookings) {
      const gid = b.booking_group_id || b.booking_group?.id;
      const gStatus = b.booking_group?.status;
      if (gid && gStatus === 'PENDING' && vnpayOn) {
        ids.add(gid);
      }
    }
    return ids;
  }, [bookings, vnpayOn]);

  const rangeLabel = useMemo(() => {
    if (total === 0) return '';
    const from = (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, total);
    return `${from}–${to} / ${total} đơn`;
  }, [page, total]);

  const load = useCallback(async () => {
    if (!getAuthToken()) {
      setError('Vui lòng đăng nhập để xem lịch sử đơn thuê.');
      setBookings([]);
      setTotal(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await bookingService.list({
        role: 'renter',
        status: filter,
        page,
        limit: PAGE_SIZE,
      });
      const body = res.data as {
        data?: BookingRow[];
        total?: number;
        totalPages?: number;
        page?: number;
      };
      const list = body?.data ?? [];
      setBookings(Array.isArray(list) ? list : []);
      setTotal(Number(body?.total ?? list.length));
      setTotalPages(Math.max(1, Number(body?.totalPages ?? 1)));
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || (e instanceof Error ? e.message : 'Không tải được danh sách'));
      setBookings([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filters: { key?: string; label: string }[] = [
    { key: undefined, label: 'Tất cả' },
    { key: 'PENDING', label: 'Đang chờ' },
    { key: 'CONFIRMED', label: 'Đã duyệt' },
    { key: 'ACTIVE', label: 'Đang thuê' },
    { key: 'COMPLETED', label: 'Hoàn tất' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-extrabold text-[#0b45b3]">
              LensLease VN
            </Link>
            <div className="hidden h-6 w-px bg-gray-200 md:block" />
            <div className="hidden text-sm font-medium text-gray-500 md:block">Lịch sử đơn thuê</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Lịch sử đơn thuê</h1>
            <p className="mt-2 text-sm text-gray-500">
              Theo dõi các đơn bạn đã đặt — tải {PAGE_SIZE} đơn mỗi trang để tối ưu tốc độ.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#0b45b3] px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            Thuê thiết bị mới
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            {filters.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  filter === f.key
                    ? 'bg-[#0b45b3] text-white'
                    : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {!loading && total > 0 && (
            <span className="text-sm font-medium text-gray-500">{rangeLabel}</span>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}{' '}
            <Link to="/login" className="font-bold underline">
              Đăng nhập
            </Link>
          </div>
        )}

        {loading ? (
          <div className="space-y-5 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row">
                  <div className="h-48 w-full rounded-2xl bg-gray-200 lg:h-40 lg:w-56" />
                  <div className="flex-1 space-y-4">
                    <div className="h-6 w-24 rounded-full bg-gray-200" />
                    <div className="h-8 w-2/3 rounded-lg bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : total === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-20 text-center">
            <h3 className="text-2xl font-bold text-gray-900">Chưa có đơn thuê</h3>
            <p className="mt-2 text-sm text-gray-500">
              {filter ? 'Không có đơn nào với bộ lọc này.' : 'Hãy thêm thiết bị vào giỏ và thanh toán.'}
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-xl bg-[#0b45b3] px-6 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Khám phá thiết bị
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {(() => {
                const shownRetryGroups = new Set<string>();
                return bookings.map((b) => {
                  const lens = b.items?.[0]?.lens;
                  const lensId = lens?.id ?? b.items?.[0]?.lens_id;
                  const st = b.status;
                  const style = statusStyles[st] || statusStyles.PENDING;
                  const groupId = b.booking_group_id || b.booking_group?.id;
                  const groupPending = b.booking_group?.status === 'PENDING';
                  const showGroupRetry =
                    vnpayOn &&
                    groupId &&
                    groupPending &&
                    retryGroupIds.has(groupId) &&
                    !shownRetryGroups.has(groupId);
                  if (showGroupRetry && groupId) {
                    shownRetryGroups.add(groupId);
                  }
                  return (
                    <div
                      key={b.id}
                      className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row">
                        <img
                          src={lensImage(b)}
                          alt=""
                          className="h-48 w-full rounded-2xl bg-gray-100 object-cover lg:h-40 lg:w-56"
                        />
                        <div className="flex flex-1 flex-col">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${style.bg} ${style.text}`}
                              >
                                {STATUS_LABEL[st] || st}
                              </div>
                              <h2 className="mt-3 text-2xl font-bold text-gray-900">
                                {lens?.title || 'Thiết bị'}
                              </h2>
                              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                <span>
                                  Chủ thiết bị:{' '}
                                  <span className="font-semibold text-[#0b45b3]">
                                    {b.owner?.full_name || '—'}
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div className="rounded-2xl bg-gray-50 px-5 py-4 text-left md:min-w-[180px] md:text-right">
                              <div className="text-xs font-medium text-gray-500">Tổng thanh toán</div>
                              <div className="mt-1 text-2xl font-extrabold text-[#0b45b3]">
                                {formatPrice(Number(b.total_price))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                            {new Date(b.start_date).toLocaleDateString('vi-VN')} —{' '}
                            {new Date(b.end_date).toLocaleDateString('vi-VN')}
                          </div>
                          {lensId && (
                            <div className="mt-4">
                              <LensRentalSchedulePanel
                                lensId={lensId}
                                startDate={String(b.start_date).split('T')[0]}
                                endDate={String(b.end_date).split('T')[0]}
                                quantity={Number(b.items?.[0]?.quantity) || 1}
                                productDetailHref={`/products/${lensId}`}
                                variant="compact"
                                collapsible
                                defaultOpen={false}
                              />
                            </div>
                          )}
                          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            <Link
                              to={`/bookings/${b.id}`}
                              className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:border-[#0b45b3] hover:bg-blue-50 hover:text-[#0b45b3]"
                            >
                              Xem chi tiết & thao tác
                            </Link>
                            {showGroupRetry && groupId ? (
                              <BookingGroupVnpayButton groupId={groupId} compact />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
                <p className="text-xs text-gray-400">
                  Trang {page} / {totalPages}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
