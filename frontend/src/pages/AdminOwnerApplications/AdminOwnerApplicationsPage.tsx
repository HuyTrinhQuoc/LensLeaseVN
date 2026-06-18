import { useCallback, useEffect, useState } from 'react';
import {
  ownerApplicationService,
  type OwnerApplication,
} from '../../services/owner-application.service';

export default function AdminOwnerApplicationsPage() {
  const [tab, setTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | ''>('PENDING');
  const [items, setItems] = useState<OwnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ownerApplicationService.listAdmin(tab || undefined);
      setItems(res.data?.data ?? []);
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || 'Không tải được danh sách');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    try {
      await ownerApplicationService.approve(id);
      await load();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      alert(msg || 'Không duyệt được');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    const note = window.prompt('Lý do từ chối (tùy chọn):') || undefined;
    setBusyId(id);
    try {
      await ownerApplicationService.reject(id, note);
      await load();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      alert(msg || 'Không từ chối được');
    } finally {
      setBusyId(null);
    }
  };

  const tabs = [
    { key: 'PENDING' as const, label: 'Chờ duyệt' },
    { key: 'APPROVED' as const, label: 'Đã duyệt' },
    { key: 'REJECTED' as const, label: 'Từ chối' },
    { key: '' as const, label: 'Tất cả' },
  ];

  return (
    <main className="flex-1 p-6 md:p-8 bg-background min-h-screen">
      <h1 className="text-2xl font-extrabold text-on-surface mb-2">Duyệt chủ cho thuê</h1>
      <p className="text-sm text-on-surface-variant mb-6 max-w-2xl">
        Phê duyệt đơn đăng ký làm chủ cho thuê — khi duyệt, tài khoản được nâng từ <strong>USER</strong>{' '}
        lên <strong>OWNER</strong>. Người dùng cần đăng xuất và đăng nhập lại để thấy menu cho thuê.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key || 'all'}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              tab === t.key
                ? 'bg-primary text-white shadow'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-red-600 text-sm mb-4">{error}</p> : null}

      {loading ? (
        <p className="text-on-surface-variant">Đang tải…</p>
      ) : items.length === 0 ? (
        <p className="text-on-surface-variant">Không có đơn nào.</p>
      ) : (
        <div className="space-y-4">
          {items.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-outline/20 bg-surface-container-lowest p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">
                    {app.user?.full_name || '—'}
                  </h2>
                  <p className="text-sm text-on-surface-variant font-mono">{app.user?.email}</p>
                  <p className="mt-2 text-sm">
                    <span className="text-on-surface-variant">SĐT:</span> {app.phone} ·{' '}
                    <span className="text-on-surface-variant">Khu vực:</span> {app.area}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="text-on-surface-variant">Thiết bị:</span> {app.equipment_types}
                  </p>
                  {app.description ? (
                    <p className="mt-2 text-sm text-on-surface-variant">{app.description}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-on-surface-variant">
                    Gửi lúc {new Date(app.created_at).toLocaleString('vi-VN')} · KYC:{' '}
                    {app.user?.kyc_status || 'Chưa'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      app.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : app.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {app.status}
                  </span>
                  {app.status === 'PENDING' ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busyId === app.id}
                        onClick={() => void handleApprove(app.id)}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
                      >
                        Duyệt → OWNER
                      </button>
                      <button
                        type="button"
                        disabled={busyId === app.id}
                        onClick={() => void handleReject(app.id)}
                        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Từ chối
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
