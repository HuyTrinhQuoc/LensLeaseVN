import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../components/common/Pagination';
import { bookingService } from '../../services/booking.service';
import { getAuthToken } from '../../utils/auth';
import {
  aggregateGroupStatus,
  groupOwnerBookings,
  lensThumb,
  primaryActionBooking,
  shortOrderId,
  sumGroupPrice,
  type OwnerBookingRow,
  type OwnerOrderDisplay,
} from '../../utils/owner-order-groups';
import '../../styles/profile-dashboard.css';

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  ACTIVE: 'Đang thuê',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Đã từ chối',
  OVERDUE: 'Quá hạn trả',
};

const STATUS_CSS: Record<string, string> = {
  PENDING: 'pdb-order-card__status-badge--pending',
  CONFIRMED: 'pdb-order-card__status-badge--confirmed',
  ACTIVE: 'pdb-order-card__status-badge--active',
  COMPLETED: 'pdb-order-card__status-badge--completed',
  CANCELLED: 'pdb-order-card__status-badge--cancelled',
  REJECTED: 'pdb-order-card__status-badge--rejected',
  OVERDUE: 'pdb-order-card__status-badge--overdue',
};

type DateField = 'start' | 'end' | 'overlap';

type FilterDef = { key: string | undefined; label: string; countKey?: string };

const FILTERS: FilterDef[] = [
  { key: undefined, label: 'Tất cả', countKey: 'all' },
  { key: 'PENDING', label: 'Chờ xác nhận', countKey: 'PENDING' },
  { key: 'ACTIVE', label: 'Đang thuê', countKey: 'ACTIVE' },
];

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

function renterInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 1);
}

function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function actionForStatus(status: string): { label: string; primary: boolean } {
  switch (status) {
    case 'PENDING': return { label: 'Duyệt đơn', primary: true };
    case 'CONFIRMED': return { label: 'Giao máy', primary: true };
    case 'ACTIVE': return { label: 'Hoàn tất', primary: true };
    default: return { label: 'Chi tiết', primary: false };
  }
}

function RenterBlock({ user }: { user?: OwnerBookingRow['user'] }) {
  return (
    <div className="pdb-order-card__renter">
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.full_name}
          className="pdb-order-card__renter-avatar"
          loading="lazy"
        />
      ) : (
        <div className="pdb-order-card__renter-avatar-fallback">
          {renterInitials(user?.full_name)}
        </div>
      )}
      <div>
        <div className="pdb-order-card__renter-name">{user?.full_name || 'Người thuê'}</div>
        <div className="pdb-order-card__renter-badge">
          {user?.member_since ? `Thành viên từ ${user.member_since}` : 'Khách hàng'}
        </div>
      </div>
    </div>
  );
}

function SingleOrderCard({ booking: b, idx }: { booking: OwnerBookingRow; idx: number }) {
  const lens = b.items?.[0]?.lens;
  const st = b.status;
  const days = calculateDays(b.start_date, b.end_date);
  const action = actionForStatus(st);

  return (
    <div className="pdb-order-card" style={{ animationDelay: `${idx * 0.05}s` }}>
      <div className="pdb-order-card__image">
        <img src={lensThumb(b)} alt={lens?.title || 'Lens'} loading="lazy" />
        <span className={`pdb-order-card__status-badge ${STATUS_CSS[st] || ''}`}>
          {STATUS_LABEL[st] || st}
        </span>
      </div>

      <div className="pdb-order-card__content">
        <div className="pdb-order-card__header">
          <h3 className="pdb-order-card__title">{lens?.title || 'Thiết bị'}</h3>
          <span className="pdb-order-card__code">#LL-{shortOrderId(b.id)}</span>
        </div>
        <div className="pdb-order-card__dates">
          <span className="material-symbols-outlined">calendar_today</span>
          {formatDateVi(b.start_date)} – {formatDateVi(b.end_date)} ({days} ngày)
        </div>
        <RenterBlock user={b.user} />
      </div>

      <div className="pdb-order-card__right">
        <span className="pdb-order-card__price">{formatPrice(Number(b.total_price))}</span>
        <Link
          to={`/bookings/${b.id}`}
          className={`pdb-order-card__action ${
            action.primary ? 'pdb-order-card__action--primary' : 'pdb-order-card__action--outline'
          }`}
        >
          {action.label}
        </Link>
      </div>
    </div>
  );
}

function GroupOrderCard({ item, idx }: { item: Extract<OwnerOrderDisplay, { kind: 'group' }>; idx: number }) {
  const lead = item.bookings[0];
  const st = aggregateGroupStatus(item.bookings);
  const days = calculateDays(lead.start_date, lead.end_date);
  const actionBooking = primaryActionBooking(item.bookings);
  const action = actionForStatus(actionBooking.status);
  const total = sumGroupPrice(item.bookings);

  return (
    <div className="pdb-order-group" style={{ animationDelay: `${idx * 0.05}s` }}>
      <div className="pdb-order-group__header">
        <div className="pdb-order-group__badge">
          <span className="material-symbols-outlined">layers</span>
          Combo · {item.bookings.length} thiết bị
        </div>
        <span className={`pdb-order-card__status-badge ${STATUS_CSS[st] || ''}`}>
          {STATUS_LABEL[st] || st}
        </span>
      </div>

      <div className="pdb-order-group__body">
        <div className="pdb-order-group__main">
          <div className="pdb-order-group__title-row">
            <h3 className="pdb-order-card__title">
              Đơn nhóm #{shortOrderId(item.groupId)}
            </h3>
            <span className="pdb-order-card__code">
              {item.bookings.length} đơn con
            </span>
          </div>

          <div className="pdb-order-card__dates">
            <span className="material-symbols-outlined">calendar_today</span>
            {formatDateVi(lead.start_date)} – {formatDateVi(lead.end_date)} ({days} ngày)
          </div>

          <RenterBlock user={lead.user} />

          <ul className="pdb-order-group__items">
            {item.bookings.map((b) => {
              const lens = b.items?.[0]?.lens;
              return (
                <li key={b.id} className="pdb-order-group__item">
                  <img src={lensThumb(b)} alt="" loading="lazy" />
                  <div className="pdb-order-group__item-info">
                    <span className="pdb-order-group__item-title">{lens?.title || 'Thiết bị'}</span>
                    <span className="pdb-order-group__item-meta">
                      #{shortOrderId(b.id)} · {formatPrice(Number(b.total_price))}
                    </span>
                  </div>
                  <span className={`pdb-order-group__item-status ${STATUS_CSS[b.status] || ''}`}>
                    {STATUS_LABEL[b.status] || b.status}
                  </span>
                  <Link to={`/bookings/${b.id}`} className="pdb-order-group__item-link">
                    Chi tiết
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="pdb-order-card__right pdb-order-group__right">
          <div className="pdb-order-group__total-label">Tổng (của bạn)</div>
          <span className="pdb-order-card__price">{formatPrice(total)}</span>
          <Link
            to={`/bookings/${actionBooking.id}`}
            className={`pdb-order-card__action ${
              action.primary ? 'pdb-order-card__action--primary' : 'pdb-order-card__action--outline'
            }`}
          >
            {action.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardOrdersPage() {
  const [bookings, setBookings] = useState<OwnerBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateField, setDateField] = useState<DateField>('overlap');
  const [appliedDates, setAppliedDates] = useState<{
    from?: string;
    to?: string;
    field: DateField;
  }>({ field: 'overlap' });

  const displayOrders = useMemo(() => groupOwnerBookings(bookings), [bookings]);

  const rangeLabel = useMemo(() => {
    if (total === 0) return '';
    const from = (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, total);
    const groups = displayOrders.filter((o) => o.kind === 'group').length;
    const suffix = groups > 0 ? ` · ${groups} nhóm combo trên trang` : '';
    return `${from}–${to} / ${total} đơn${suffix}`;
  }, [page, total, displayOrders]);

  useEffect(() => {
    setPage(1);
  }, [filter, appliedDates, search]);

  useEffect(() => {
    const t = window.setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!getAuthToken()) throw new Error('Vui lòng đăng nhập');
      const res = await bookingService.list({
        role: 'owner',
        status: filter,
        page,
        limit: PAGE_SIZE,
        from_date: appliedDates.from,
        to_date: appliedDates.to,
        date_field: appliedDates.field,
        search: search || undefined,
      });
      const body = res.data as {
        data?: OwnerBookingRow[];
        total?: number;
        totalPages?: number;
        status_counts?: Record<string, number>;
      };
      const list = body?.data ?? [];
      setBookings(Array.isArray(list) ? list : []);
      setTotal(Number(body?.total ?? list.length));
      setTotalPages(Math.max(1, Number(body?.totalPages ?? 1)));
      setStatusCounts(body?.status_counts ?? {});
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || (err instanceof Error ? err.message : 'Không tải được danh sách'));
      setBookings([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filter, page, appliedDates, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const countForTab = (f: FilterDef) => {
    if (!f.countKey) return 0;
    return statusCounts[f.countKey] ?? 0;
  };

  const applyDateFilter = () => {
    setAppliedDates({
      from: fromDate || undefined,
      to: toDate || undefined,
      field: dateField,
    });
  };

  const clearDateFilter = () => {
    setFromDate('');
    setToDate('');
    setDateField('overlap');
    setAppliedDates({ field: 'overlap' });
  };

  const filterReturnsToday = () => {
    const today = todayYmd();
    setFromDate(today);
    setToDate(today);
    setDateField('end');
    setAppliedDates({ from: today, to: today, field: 'end' });
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasDateFilter = !!(appliedDates.from || appliedDates.to);

  return (
    <div className="pdb-orders">
      <div className="pdb-orders__intro">
        <div>
          <h2 className="pdb-orders__heading">Quản lý đơn cho thuê</h2>
          <p className="pdb-orders__sub">
            Phân trang, gom combo và lọc theo ngày — sẵn sàng vận hành quy mô lớn.
          </p>
        </div>
        {rangeLabel && <div className="pdb-orders__range">{rangeLabel}</div>}
      </div>

      <div className="pdb-orders__toolbar">
        <div className="pdb-orders__tabs">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`pdb-orders__tab ${filter === f.key ? 'active' : ''}`}
            >
              {f.label} ({countForTab(f)})
            </button>
          ))}
        </div>

        <div className="pdb-orders__search">
          <span className="material-symbols-outlined pdb-orders__search-icon">search</span>
          <input
            type="text"
            placeholder="Mã đơn, tên khách, tên thiết bị..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      <div className="pdb-orders__filters">
        <div className="pdb-orders__filter-row">
          <label className="pdb-orders__field">
            <span>Từ ngày</span>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label className="pdb-orders__field">
            <span>Đến ngày</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <label className="pdb-orders__field">
            <span>Lọc theo</span>
            <select value={dateField} onChange={(e) => setDateField(e.target.value as DateField)}>
              <option value="overlap">Trong khoảng thuê</option>
              <option value="start">Ngày nhận máy</option>
              <option value="end">Ngày trả máy</option>
            </select>
          </label>
          <button type="button" className="pdb-orders__btn pdb-orders__btn--primary" onClick={applyDateFilter}>
            Áp dụng
          </button>
          {hasDateFilter && (
            <button type="button" className="pdb-orders__btn pdb-orders__btn--ghost" onClick={clearDateFilter}>
              Xóa lọc
            </button>
          )}
          <button type="button" className="pdb-orders__btn pdb-orders__btn--quick" onClick={filterReturnsToday}>
            <span className="material-symbols-outlined">event_available</span>
            Trả máy hôm nay
          </button>
        </div>
      </div>

      {error && <div className="pdb-orders__error">{error}</div>}

      {loading && <div className="pdb-orders__loading">Đang tải đơn cho thuê...</div>}

      {!loading && displayOrders.length === 0 && (
        <div className="pdb-orders__empty">
          <span className="material-symbols-outlined pdb-orders__empty-icon">inventory_2</span>
          <h3>{hasDateFilter || search ? 'Không có đơn phù hợp' : 'Chưa có đơn nào'}</h3>
          <p>
            {hasDateFilter || search
              ? 'Thử đổi bộ lọc ngày hoặc từ khóa tìm kiếm.'
              : 'Khi có người thuê thiết bị của bạn, đơn sẽ xuất hiện tại đây.'}
          </p>
        </div>
      )}

      {!loading &&
        displayOrders.map((item, idx) =>
          item.kind === 'group' ? (
            <GroupOrderCard key={item.groupId} item={item} idx={idx} />
          ) : (
            <SingleOrderCard key={item.booking.id} booking={item.booking} idx={idx} />
          ),
        )}

      {!loading && totalPages > 1 && (
        <div className="pdb-orders__pagination">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
}
