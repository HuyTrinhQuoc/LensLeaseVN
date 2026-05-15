import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LensRentalSchedulePanel from '../../components/scheduling/LensRentalSchedulePanel';
import { bookingService } from '../../services/booking.service';
import { getAuthToken } from '../../utils/auth';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ bạn duyệt',
  CONFIRMED: 'Đã duyệt — cần giao máy',
  ACTIVE: 'Đang cho thuê',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Đã từ chối',
  OVERDUE: 'Quá hạn trả',
};

function formatPrice(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function lensImage(b: any): string {
  const lens = b.items?.[0]?.lens;
  if (!lens) return 'https://placehold.co/600x400/e2e8f0/64748b?text=Lens';
  if (lens.thumbnail) return lens.thumbnail;
  const img = lens.images?.[0];
  return img?.image_url || img?.url || 'https://placehold.co/600x400/e2e8f0/64748b?text=Lens';
}

export default function LenderOrdersPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!getAuthToken()) {
      setError('Vui lòng đăng nhập.');
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await bookingService.list({
        role: 'owner',
        status: filter,
        page: 1,
        limit: 50,
      });
      const list = res.data?.data ?? res.data ?? [];
      setBookings(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Không tải được đơn');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const filters: { key?: string; label: string }[] = [
    { key: undefined, label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ duyệt' },
    { key: 'CONFIRMED', label: 'Chờ giao' },
    { key: 'ACTIVE', label: 'Đang thuê' },
    { key: 'COMPLETED', label: 'Hoàn tất' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-2">Đơn cho thuê</h2>
          <p className="text-gray-500 font-medium text-sm">
            <code className="bg-gray-100 px-1 rounded">GET /bookings?role=owner</code> — Duyệt, giao máy, hoàn tất
            trong trang chi tiết.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center justify-center rounded-xl bg-[#0b45b3] px-4 py-2.5 text-white text-sm font-semibold hover:bg-blue-800"
        >
          Quản lý tin đăng
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">{error}</div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              filter === f.key ? 'bg-[#0b45b3] text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 py-12 text-center">Đang tải…</p>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-gray-600">
          Chưa có đơn nào ở bộ lọc này.
        </div>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => {
            const lens = b.items?.[0]?.lens;
            const lensId = lens?.id ?? b.items?.[0]?.lens_id;
            const st = b.status as string;
            return (
              <li
                key={b.id}
                className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <img src={lensImage(b)} alt="" className="w-full sm:w-32 h-28 object-cover rounded-xl bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase text-[#0b45b3]">{STATUS_LABEL[st] || st}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 truncate">{lens?.title || 'Thiết bị'}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Khách: <span className="font-medium text-gray-800">{b.user?.full_name || '—'}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(b.start_date).toLocaleDateString('vi-VN')} —{' '}
                    {new Date(b.end_date).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-sm font-bold text-[#0b45b3] mt-2">{formatPrice(Number(b.total_price))}</p>
                  {lensId && (
                    <div className="mt-3 w-full min-w-0">
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
                </div>
                <div className="flex sm:flex-col gap-2 justify-end">
                  <Link
                    to={`/bookings/${b.id}`}
                    className="inline-flex items-center justify-center rounded-xl bg-[#0b45b3] px-4 py-2.5 text-white text-sm font-semibold whitespace-nowrap"
                  >
                    Chi tiết & xử lý
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
