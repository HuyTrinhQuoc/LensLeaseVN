import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import { getAuthToken } from '../../utils/auth';
import '../../styles/profile-dashboard.css';


/* ── Status helpers ────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  PENDING:   'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  ACTIVE:    'Đang thuê',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  REJECTED:  'Đã từ chối',
  OVERDUE:   'Quá hạn trả',
};

const STATUS_CSS: Record<string, string> = {
  PENDING:   'pdb-order-card__status-badge--pending',
  CONFIRMED: 'pdb-order-card__status-badge--confirmed',
  ACTIVE:    'pdb-order-card__status-badge--active',
  COMPLETED: 'pdb-order-card__status-badge--completed',
  CANCELLED: 'pdb-order-card__status-badge--cancelled',
  REJECTED:  'pdb-order-card__status-badge--rejected',
  OVERDUE:   'pdb-order-card__status-badge--overdue',
};

function formatPrice(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function formatDateVi(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function calculateDays(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function lensImage(b: any): string {
  const lens = b.items?.[0]?.lens;
  if (!lens) return 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Lens';
  if (lens.thumbnail) return lens.thumbnail;
  const img = lens.images?.[0];
  return img?.image_url || img?.url || 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Lens';
}

function renterInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 1);
}

/* Bộ lọc trạng thái đơn (chủ thiết bị) */
type FilterDef = { key: string | undefined; label: string };

const FILTERS: FilterDef[] = [
  { key: undefined,  label: 'Tất cả' },
  { key: 'PENDING',  label: 'Chờ xác nhận' },
  { key: 'ACTIVE',   label: 'Đang thuê' },
];

export default function DashboardOrdersPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (!getAuthToken()) throw new Error('no-auth');
      const res = await bookingService.list({ role: 'owner', status: filter, page: 1, limit: 50 });
      const list = res.data?.data ?? res.data ?? [];
      const arr = Array.isArray(list) ? list : [];
      setAllBookings(arr);
      setBookings(arr);
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err);
      setAllBookings([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  // Client-side search
  useEffect(() => {
    const source = allBookings;

    if (!search.trim()) {
      setBookings(source);
      return;
    }
    const q = search.toLowerCase();
    setBookings(
      source.filter((b) => {
        const lens = b.items?.[0]?.lens;
        const title = lens?.title?.toLowerCase() || '';
        const renter = b.user?.full_name?.toLowerCase() || '';
        const code = b.id?.toLowerCase() || '';
        return title.includes(q) || renter.includes(q) || code.includes(q);
      }),
    );
  }, [search, allBookings]);

  // Count per filter
  const source = allBookings;
  const countByStatus = (status?: string) => {
    if (!status) return source.length;
    return source.filter((b) => b.status === status).length;
  };

  /* ── Action button based on status ── */
  function actionForStatus(status: string): { label: string; primary: boolean } {
    switch (status) {
      case 'PENDING':   return { label: 'Duyệt đơn', primary: true };
      case 'CONFIRMED': return { label: 'Giao máy',   primary: true };
      case 'ACTIVE':    return { label: 'Hoàn tất',   primary: true };
      default:          return { label: 'Chi tiết',   primary: false };
    }
  }

  return (
    <div className="pdb-orders">
      {/* ── Toolbar: Tabs + Search ── */}
      <div className="pdb-orders__toolbar">
        <div className="pdb-orders__tabs">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`pdb-orders__tab ${filter === f.key ? 'active' : ''}`}
            >
              {f.label} ({countByStatus(f.key)})
            </button>
          ))}
        </div>

        <div className="pdb-orders__search">
          <span className="material-symbols-outlined pdb-orders__search-icon">search</span>
          <input
            type="text"
            placeholder="Tìm mã đơn, tên thiết bị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && <div className="pdb-orders__loading">Đang tải đơn cho thuê...</div>}

      {/* ── Empty ── */}
      {!loading && bookings.length === 0 && (
        <div className="pdb-orders__empty">
          <span className="material-symbols-outlined pdb-orders__empty-icon">inventory_2</span>
          <h3>Chưa có đơn nào</h3>
          <p>Khi có người thuê thiết bị của bạn, đơn sẽ xuất hiện tại đây.</p>
        </div>
      )}

      {/* ── Order Cards ── */}
      {!loading && bookings.map((b, idx) => {
        const lens = b.items?.[0]?.lens;
        const st = b.status as string;
        const days = calculateDays(b.start_date, b.end_date);
        const action = actionForStatus(st);
        const shortId = b.id?.replace(/-/g, '').slice(0, 5).toUpperCase();
        const memberSince = b.user?.member_since;

        return (
          <div
            className="pdb-order-card"
            key={b.id}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {/* ── Image + Status Badge ── */}
            <div className="pdb-order-card__image">
              <img src={lensImage(b)} alt={lens?.title || 'Lens'} loading="lazy" />
              <span className={`pdb-order-card__status-badge ${STATUS_CSS[st] || ''}`}>
                {STATUS_LABEL[st] || st}
              </span>
            </div>

            {/* ── Content: Title, Dates, Renter ── */}
            <div className="pdb-order-card__content">
              <div className="pdb-order-card__header">
                <h3 className="pdb-order-card__title">{lens?.title || 'Thiết bị'}</h3>
                <span className="pdb-order-card__code">#LL-{shortId}</span>
              </div>

              <div className="pdb-order-card__dates">
                <span className="material-symbols-outlined">calendar_today</span>
                {formatDateVi(b.start_date)} - {formatDateVi(b.end_date)} ({days} ngày)
              </div>

              {/* Renter info */}
              <div className="pdb-order-card__renter">
                {b.user?.avatar_url ? (
                  <img
                    src={b.user.avatar_url}
                    alt={b.user.full_name}
                    className="pdb-order-card__renter-avatar"
                    loading="lazy"
                  />
                ) : (
                  <div className="pdb-order-card__renter-avatar-fallback">
                    {renterInitials(b.user?.full_name)}
                  </div>
                )}
                <div>
                  <div className="pdb-order-card__renter-name">
                    {b.user?.full_name || 'Người thuê'}
                  </div>
                  <div className="pdb-order-card__renter-badge">
                    {memberSince
                      ? `Thành viên từ ${memberSince}`
                      : 'Khách hàng mới'}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Price + Action ── */}
            <div className="pdb-order-card__right">
              <span className="pdb-order-card__price">
                {formatPrice(Number(b.total_price))}
              </span>
              <Link
                to={`/bookings/${b.id}`}
                className={`pdb-order-card__action ${
                  action.primary
                    ? 'pdb-order-card__action--primary'
                    : 'pdb-order-card__action--outline'
                }`}
              >
                {action.label}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
