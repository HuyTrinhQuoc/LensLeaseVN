import React, { useCallback, useEffect, useState } from 'react';
import {
  adminFinanceService,
  type AdminPayoutRow,
  type AdminTransactionRow,
  type FinanceSummary,
} from '../../services/admin-finance.service';

const formatVnd = (n: number) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(n));

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const PAYOUT_STATUS: Record<
  AdminPayoutRow['status'],
  { label: string; bg: string; color: string }
> = {
  PENDING: { label: 'Chờ duyệt', bg: 'bg-[#FFF4CE]', color: 'text-[#8A6D3B]' },
  PROCESSING: { label: 'Đang xử lý', bg: 'bg-[#E1F0FF]', color: 'text-[#0056D2]' },
  COMPLETED: { label: 'Đã chi', bg: 'bg-[#E6F4EA]', color: 'text-[#137333]' },
  REJECTED: { label: 'Từ chối', bg: 'bg-[#FCE8E8]', color: 'text-[#C5221F]' },
};

const TX_INCOME_TYPES = new Set(['DEPOSIT', 'RENTAL_FEE', 'REFUND']);

function txTitle(row: AdminTransactionRow): string {
  const base = row.description || row.type;
  if (row.booking?.id) {
    return `${base} — Booking #${row.booking.id.slice(0, 8)}`;
  }
  return base;
}

export default function AdminFinance() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [payouts, setPayouts] = useState<AdminPayoutRow[]>([]);
  const [transactions, setTransactions] = useState<AdminTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, payoutsRes, txRes] = await Promise.all([
        adminFinanceService.getSummary(),
        adminFinanceService.listPayouts({ status: 'PENDING,PROCESSING', limit: 20 }),
        adminFinanceService.getTransactions({ limit: 10 }),
      ]);
      setSummary(summaryRes.data?.data ?? null);
      setPayouts(payoutsRes.data?.data ?? []);
      setTransactions(txRes.data?.data ?? []);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || 'Không tải được dữ liệu tài chính. Vui lòng đăng nhập bằng tài khoản Admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await adminFinanceService.approvePayout(id);
      await loadData();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      alert(msg || 'Không thể duyệt chi');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Nhập lý do từ chối (tiền sẽ hoàn về ví chủ thuê):');
    if (!reason?.trim()) return;
    setActionId(id);
    try {
      await adminFinanceService.rejectPayout(id, reason.trim());
      await loadData();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      alert(msg || 'Không thể từ chối yêu cầu');
    } finally {
      setActionId(null);
    }
  };

  const summaryCards = summary
    ? [
        {
          id: '1',
          title: 'Hoa hồng đã thu (tất cả)',
          icon: 'account_balance_wallet',
          iconColor: 'text-primary',
          amount: formatVnd(summary.commission_collected_all_time),
          subtitle: `Chờ chi: ${formatVnd(summary.pending_payout_amount)} VND`,
        },
        {
          id: '2',
          title: 'Hoa hồng tháng này',
          icon: 'pie_chart',
          iconColor: 'text-primary',
          amount: formatVnd(summary.commission_collected_this_month),
          subtitle: 'VND',
        },
        {
          id: '3',
          title: 'Tiền cọc đang giữ',
          icon: 'lock',
          iconColor: 'text-status-warning',
          amount: formatVnd(summary.escrow_held),
          subtitle: 'Tổng pending_balance trên ví người dùng',
        },
      ]
    : [];

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-8 text-on-surface">
      <div>
        <h2 className="mb-2 text-4xl font-extrabold md:text-5xl">Tài Chính & Thanh Toán</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Quản lý dòng tiền, hoa hồng và phê duyệt rút tiền cho đối tác.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-on-surface-variant">Đang tải dữ liệu…</div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {summaryCards.map((item) => (
              <div
                key={item.id}
                className="flex min-h-[140px] flex-col justify-between rounded-xl bg-surface-container-lowest p-6 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                    {item.title}
                  </span>
                  <span
                    className={`material-symbols-outlined ${item.iconColor}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.icon}
                  </span>
                </div>
                <div>
                  <div className="mb-1 text-3xl font-bold md:text-4xl">{item.amount}</div>
                  <div className="font-data-mono text-sm">{item.subtitle}</div>
                </div>
              </div>
            ))}
          </section>

          <section className="flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest">
            <div className="flex items-center justify-between bg-surface-bright p-6">
              <h3 className="font-headline-sm text-headline-sm font-semibold">
                Yêu Cầu Rút Tiền
              </h3>
              <button
                type="button"
                onClick={() => void loadData()}
                className="font-label-md text-label-md flex items-center gap-1 text-primary hover:underline"
              >
                Làm mới
                <span className="material-symbols-outlined text-[16px]">refresh</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse whitespace-nowrap text-left">
                <thead className="glass-header sticky top-0 z-10 bg-surface-container-lowest">
                  <tr>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                      Đối tác / Chủ cho thuê
                    </th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                      Số tiền (VND)
                    </th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                      Thông tin Ngân hàng
                    </th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-right font-label-md text-label-md text-on-surface-variant">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md">
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                        Không có yêu cầu rút tiền đang chờ xử lý.
                      </td>
                    </tr>
                  ) : (
                    payouts.map((req) => {
                      const st = PAYOUT_STATUS[req.status];
                      const bankInfo = [req.bank_name, req.bank_account]
                        .filter(Boolean)
                        .join(' — ');
                      return (
                        <tr
                          key={req.id}
                          className="group transition-colors hover:bg-surface-muted"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium">
                              {req.owner?.full_name || req.bank_owner_name || '—'}
                            </div>
                            <div className="mt-1 font-data-mono text-[11px] text-on-surface-variant">
                              ID: {req.owner_id.slice(0, 8)}…
                            </div>
                          </td>
                          <td className="px-6 py-4 font-data-mono font-medium">
                            {formatVnd(req.amount)}
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">
                            {bankInfo || '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-md text-[11px] ${st.bg} ${st.color}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {st.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {req.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-3 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                                <button
                                  type="button"
                                  disabled={actionId === req.id}
                                  onClick={() => void handleReject(req.id)}
                                  className="font-label-md text-on-surface-variant transition-colors hover:text-error disabled:opacity-50"
                                >
                                  Từ chối
                                </button>
                                <button
                                  type="button"
                                  disabled={actionId === req.id}
                                  onClick={() => void handleApprove(req.id)}
                                  className="rounded-lg bg-primary px-4 py-2 font-label-md text-on-primary shadow-sm transition-colors hover:bg-[#004bb8] disabled:opacity-50"
                                >
                                  {actionId === req.id ? 'Đang xử lý…' : 'Duyệt chi'}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-on-surface-variant">
                                {formatDateTime(req.created_at)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl bg-surface-container-lowest p-6">
            <h3 className="mb-5 font-headline-sm text-headline-sm font-semibold">
              Lịch Sử Giao Dịch Gần Đây
            </h3>
            <div className="flex flex-col gap-3">
              {transactions.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Chưa có giao dịch.</p>
              ) : (
                transactions.map((tx) => {
                  const isIncome = TX_INCOME_TYPES.has(tx.type) && tx.status === 'SUCCESS';
                  const sign = isIncome ? '+' : '−';
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-xl p-3 px-4 transition-colors hover:bg-surface-muted"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isIncome
                              ? 'bg-[#E6F4EA] text-status-success'
                              : 'bg-[#FCE8E8] text-status-error'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isIncome ? 'arrow_downward' : 'arrow_upward'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{txTitle(tx)}</div>
                          <div className="mt-1 font-data-mono text-[12px] text-on-surface-variant">
                            {tx.user?.full_name || tx.user?.email || '—'} ·{' '}
                            {formatDateTime(tx.created_at)}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`font-data-mono font-bold ${
                          isIncome ? 'text-status-success' : 'text-on-surface'
                        }`}
                      >
                        {sign} {formatVnd(tx.amount)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
