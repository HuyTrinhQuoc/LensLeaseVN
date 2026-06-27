import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminListingsService,
  type AdminListingRow,
  type ListingApprovalStatus,
  type ListingStats,
} from '../../services/admin-listings.service';

const STATUS_LABEL: Record<ListingApprovalStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
};

const STATUS_BADGE: Record<ListingApprovalStatus, string> = {
  PENDING: 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]',
  APPROVED: 'bg-[#E6F4EA] text-[#137333] border-[#C8E6C9]',
  REJECTED: 'bg-[#FCE8E8] text-[#C5221F] border-[#F5C6C6]',
};

const formatVnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function AdminListingsManagement() {
  const [tab, setTab] = useState<ListingApprovalStatus>('PENDING');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [listings, setListings] = useState<AdminListingRow[]>([]);
  const [stats, setStats] = useState<ListingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, listRes] = await Promise.all([
        adminListingsService.getStats(),
        adminListingsService.list({
          status: tab,
          search: search || undefined,
          limit: 50,
        }),
      ]);
      setStats(statsRes.data?.data ?? null);
      setListings(listRes.data?.data ?? []);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || 'Không tải được danh sách tin đăng. Vui lòng đăng nhập bằng tài khoản Admin.');
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Duyệt tin đăng này? Khách sẽ có thể thêm vào giỏ hàng.')) return;
    setActionId(id);
    try {
      await adminListingsService.approve(id);
      await loadData();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      alert(msg || 'Không thể duyệt tin đăng');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Nhập lý do từ chối (tuỳ chọn):');
    if (reason === null) return;
    setActionId(id);
    try {
      await adminListingsService.reject(id, reason.trim() || undefined);
      await loadData();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      alert(msg || 'Không thể từ chối tin đăng');
    } finally {
      setActionId(null);
    }
  };

  const tabCount = (s: ListingApprovalStatus) => {
    if (!stats) return 0;
    if (s === 'PENDING') return stats.pending;
    if (s === 'APPROVED') return stats.approved;
    return stats.rejected;
  };

  return (
    <main className="mx-auto max-w-[1440px] px-margin-page py-8 font-body-md text-on-surface">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="mb-2 text-4xl font-extrabold text-on-surface md:text-5xl">
            Duyệt Tin Đăng
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Kiểm duyệt thiết bị chủ cho thuê trước khi khách có thể đặt thuê trên sàn.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadData()}
          className="flex items-center gap-2 rounded-lg bg-surface-container-lowest px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:text-primary-container"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Làm mới
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center gap-4 pb-4">
        {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setTab(s)}
            className={`font-label-md text-label-md px-4 py-2 transition-colors ${
              tab === s
                ? 'border-b-2 border-primary text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {STATUS_LABEL[s]} ({tabCount(s)})
          </button>
        ))}
        <div className="flex-grow" />
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            className="w-full rounded-lg bg-surface-container-lowest py-2 pl-9 pr-3 font-body-md text-body-md transition-shadow focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Tìm theo tên, chủ thuê..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
      </div>

      {loading ? (
        <div className="py-16 text-center text-on-surface-variant">Đang tải tin đăng…</div>
      ) : listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline/30 bg-surface-container-lowest py-16 text-center text-on-surface-variant">
          Không có tin đăng nào ở trạng thái &quot;{STATUS_LABEL[tab]}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {listings.map((item) => {
            const image =
              item.image_url ||
              item.thumbnail ||
              'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800';
            const location =
              [item.district, item.city].filter(Boolean).join(', ') || 'Chưa cập nhật';
            const ownerName = item.owner?.full_name || '—';
            const ownerAvatar = item.owner?.avatar_url;

            return (
              <div
                key={item.id}
                className="group flex h-full flex-col overflow-hidden rounded-xl bg-surface-container-lowest transition-shadow duration-300 hover:shadow-[0px_4px_12px_rgba(0,0,0,0.05)]"
              >
                <div className="relative h-48 overflow-hidden bg-surface-variant">
                  <img
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={image}
                  />
                  <div
                    className={`absolute left-3 top-3 flex items-center gap-1 rounded border px-2 py-1 font-label-md text-label-md ${STATUS_BADGE[item.approval_status]}`}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                    {STATUS_LABEL[item.approval_status]}
                  </div>
                </div>

                <div className="flex flex-grow flex-col p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 font-headline-sm text-headline-sm text-on-surface">
                      {item.title}
                    </h3>
                    {item.category?.name && (
                      <span className="shrink-0 rounded bg-surface-container-high px-2 py-1 font-label-md text-label-md text-on-surface-variant">
                        {item.category.name}
                      </span>
                    )}
                  </div>

                  <div className="mb-4 flex items-center gap-2">
                    {ownerAvatar ? (
                      <img
                        src={ownerAvatar}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {ownerName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      {ownerName}
                    </span>
                    <span className="mx-1 text-surface-dim">•</span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      {location}
                    </span>
                  </div>

                  <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-surface-container-low p-3">
                    <div>
                      <span className="mb-1 block font-label-md text-label-md text-on-surface-variant">
                        Giá thuê / ngày
                      </span>
                      <span className="font-data-mono text-data-mono font-bold text-primary">
                        {formatVnd(item.price_per_day)}
                      </span>
                    </div>
                    <div>
                      <span className="mb-1 block font-label-md text-label-md text-on-surface-variant">
                        Giá trị thiết bị
                      </span>
                      <span className="font-data-mono text-data-mono text-on-surface">
                        {item.market_value != null
                          ? formatVnd(item.market_value)
                          : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
                    <Link
                      to={`/products/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="col-span-2 flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-surface-container-lowest py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-low"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      Xem chi tiết
                    </Link>
                    {tab === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          disabled={actionId === item.id}
                          onClick={() => void handleReject(item.id)}
                          className="w-full rounded-lg border border-error bg-surface-container-lowest py-2 font-label-md text-label-md text-error transition-colors hover:bg-error-container disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                        <button
                          type="button"
                          disabled={actionId === item.id}
                          onClick={() => void handleApprove(item.id)}
                          className="w-full rounded-lg bg-primary py-2 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-[#004bb8] disabled:opacity-50"
                        >
                          {actionId === item.id ? 'Đang xử lý…' : 'Duyệt'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
