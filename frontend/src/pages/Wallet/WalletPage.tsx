import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import { getAuthToken } from '../../utils/auth';
import { walletService } from '../../services/wallet.service';
import WalletTopupModal from '../../components/wallet/WalletTopupModal';
import WalletWithdrawModal from '../../components/wallet/WalletWithdrawModal';

const PAGE_SIZE = 10;

type WalletTab = 'transactions' | 'ledger' | 'payouts';

interface WalletBalance {
  available_balance: number;
  pending_balance: number;
}

interface WalletStats {
  total_earned: number;
  total_commission_paid: number;
  total_refunded: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

interface WalletLedgerRow {
  id: string;
  bucket: string;
  direction: string;
  amount: number;
  available_before: number;
  available_after: number;
  pending_before: number;
  pending_after: number;
  note: string | null;
  created_at: string;
  booking_id?: string | null;
  booking_group_id?: string | null;
}

interface PayoutRow {
  id: string;
  amount: number;
  status: string;
  bank_name: string | null;
  bank_account: string | null;
  created_at: string;
}

interface PaginatedMeta {
  total: number;
  page: number;
  totalPages: number;
}

const TX_TYPE_OPTIONS = [
  { value: '', label: 'Tất cả loại' },
  { value: 'DEPOSIT', label: 'Nạp tiền' },
  { value: 'RENTAL_FEE', label: 'Phí thuê' },
  { value: 'REFUND', label: 'Hoàn tiền' },
  { value: 'COMMISSION', label: 'Phí sàn' },
  { value: 'PAYOUT', label: 'Rút tiền' },
] as const;

const TX_TYPE_LABELS: Record<string, string> = {
  DEPOSIT: 'Nạp tiền',
  RENTAL_FEE: 'Phí thuê',
  REFUND: 'Hoàn tiền',
  COMMISSION: 'Phí sàn',
  PAYOUT: 'Rút tiền',
};

const TX_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Đang xử lý',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
};

const PAYOUT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn tất',
  REJECTED: 'Từ chối',
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortId(id: string) {
  return id.substring(0, 8).toUpperCase();
}

export default function WalletPage() {
  const [balance, setBalance] = useState<WalletBalance>({
    available_balance: 0,
    pending_balance: 0,
  });
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [topupOpen, setTopupOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<WalletTab>('transactions');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txTypeFilter, setTxTypeFilter] = useState('');
  const [txMeta, setTxMeta] = useState<PaginatedMeta>({ total: 0, page: 1, totalPages: 1 });
  const [txLoading, setTxLoading] = useState(false);

  const [ledger, setLedger] = useState<WalletLedgerRow[]>([]);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerMeta, setLedgerMeta] = useState<PaginatedMeta>({ total: 0, page: 1, totalPages: 1 });
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutMeta, setPayoutMeta] = useState<PaginatedMeta>({ total: 0, page: 1, totalPages: 1 });
  const [payoutLoading, setPayoutLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setAuthError('Vui lòng đăng nhập để xem ví ký quỹ.');
      return false;
    }
    setAuthError(null);

    try {
      const [balRes, statsRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getStats().catch(() => null),
      ]);

      const balData = balRes.data?.data ?? balRes.data;
      if (balData) {
        setBalance({
          available_balance: Number(balData.available_balance ?? 0),
          pending_balance: Number(balData.pending_balance ?? 0),
        });
      }

      if (statsRes?.data?.data) {
        const s = statsRes.data.data as WalletStats;
        setStats({
          total_earned: Number(s.total_earned ?? 0),
          total_commission_paid: Number(s.total_commission_paid ?? 0),
          total_refunded: Number(s.total_refunded ?? 0),
        });
      }
      return true;
    } catch (err) {
      console.error('Wallet summary fetch error:', err);
      return false;
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    if (!getAuthToken()) return;
    setTxLoading(true);
    try {
      const res = await walletService.getTransactions({
        page: txPage,
        limit: PAGE_SIZE,
        type: txTypeFilter || undefined,
      });
      const body = res.data as {
        data?: Transaction[];
        total?: number;
        page?: number;
        totalPages?: number;
      };
      setTransactions(
        (body.data ?? []).map((tx) => ({
          ...tx,
          amount: Number(tx.amount),
        })),
      );
      setTxMeta({
        total: body.total ?? 0,
        page: body.page ?? txPage,
        totalPages: Math.max(1, body.totalPages ?? 1),
      });
    } catch (err) {
      console.error('Transactions fetch error:', err);
    } finally {
      setTxLoading(false);
    }
  }, [txPage, txTypeFilter]);

  const loadLedger = useCallback(async () => {
    if (!getAuthToken()) return;
    setLedgerLoading(true);
    try {
      const res = await walletService.getLedger({ page: ledgerPage, limit: PAGE_SIZE });
      const body = res.data as {
        data?: WalletLedgerRow[];
        total?: number;
        page?: number;
        totalPages?: number;
      };
      setLedger(
        (body.data ?? []).map((r) => ({
          ...r,
          amount: Number(r.amount),
          available_before: Number(r.available_before),
          available_after: Number(r.available_after),
          pending_before: Number(r.pending_before),
          pending_after: Number(r.pending_after),
        })),
      );
      setLedgerMeta({
        total: body.total ?? 0,
        page: body.page ?? ledgerPage,
        totalPages: Math.max(1, body.totalPages ?? 1),
      });
    } catch (err) {
      console.error('Ledger fetch error:', err);
    } finally {
      setLedgerLoading(false);
    }
  }, [ledgerPage]);

  const loadPayouts = useCallback(async () => {
    if (!getAuthToken()) return;
    setPayoutLoading(true);
    try {
      const res = await walletService.getPayouts({ page: payoutPage, limit: PAGE_SIZE });
      const body = res.data as {
        data?: PayoutRow[];
        total?: number;
        page?: number;
        totalPages?: number;
      };
      setPayouts(
        (body.data ?? []).map((p) => ({
          ...p,
          amount: Number(p.amount),
        })),
      );
      setPayoutMeta({
        total: body.total ?? 0,
        page: body.page ?? payoutPage,
        totalPages: Math.max(1, body.totalPages ?? 1),
      });
    } catch (err) {
      console.error('Payouts fetch error:', err);
    } finally {
      setPayoutLoading(false);
    }
  }, [payoutPage]);

  const refreshAll = useCallback(async () => {
    setLoadingSummary(true);
    const ok = await fetchSummary();
    setLoadingSummary(false);
    if (!ok) return;
    await Promise.all([loadTransactions(), loadLedger(), loadPayouts()]);
  }, [fetchSummary, loadTransactions, loadLedger, loadPayouts]);

  useEffect(() => {
    void (async () => {
      setLoadingSummary(true);
      await fetchSummary();
      setLoadingSummary(false);
    })();
  }, [fetchSummary]);

  useEffect(() => {
    if (activeTab === 'transactions') void loadTransactions();
  }, [activeTab, loadTransactions]);

  useEffect(() => {
    if (activeTab === 'ledger') void loadLedger();
  }, [activeTab, loadLedger]);

  useEffect(() => {
    if (activeTab === 'payouts') void loadPayouts();
  }, [activeTab, loadPayouts]);

  const location = useLocation();
  useEffect(() => {
    const state = location.state as { openTopup?: boolean } | null;
    if (state?.openTopup) {
      setTopupOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleWithdrawSubmit = async (amount: number) => {
    await walletService.withdraw(amount);
    toast.success('Tạo yêu cầu rút tiền thành công! Vui lòng chờ quản trị viên duyệt.');
    await refreshAll();
  };

  const handleTxTypeChange = (value: string) => {
    setTxTypeFilter(value);
    setTxPage(1);
  };

  if (loadingSummary) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="font-medium text-gray-500">Đang tải ví...</p>
      </div>
    );
  }

  if (authError && !getAuthToken()) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-gray-600">{authError}</p>
        <a href="/login" className="rounded-xl bg-[#1a3fc7] px-6 py-2 font-bold text-white">
          Đăng nhập
        </a>
      </div>
    );
  }

  const tabBtn = (tab: WalletTab, label: string, icon: string) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
        activeTab === tab
          ? 'bg-[#1a3fc7] text-white shadow-md'
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-[26px] font-extrabold tracking-tight text-slate-900">Ví của tôi</h1>
          <p className="text-sm font-medium text-slate-500">
            Quản lý số dư, tiền cọc và lịch sử giao dịch của bạn.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refreshAll()}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Làm mới
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-[#1a3fc7] p-6 text-white shadow-lg">
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 transform rounded-full bg-white opacity-10 blur-2xl" />
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-white/80">account_balance_wallet</span>
            <span className="text-sm font-semibold text-white/90">Số dư khả dụng</span>
          </div>
          <div className="mb-4 text-3xl font-extrabold">
            {formatPrice(balance.available_balance)} <span className="text-xl font-medium">đ</span>
          </div>
          <p className="mb-4 text-[11px] leading-relaxed text-white/75">
            Nạp tiền qua <strong className="text-white">VNPay</strong> hoặc{' '}
            <strong className="text-white">MoMo</strong>. Thanh toán nhóm đơn qua VNPay từ trang xác nhận hoặc lịch
            sử đơn.
          </p>
          <button
            type="button"
            onClick={() => {
              if (!getAuthToken()) {
                toast.error('Vui lòng đăng nhập.');
                return;
              }
              setTopupOpen(true);
            }}
            className="mb-2 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-[#1a3fc7] shadow-sm transition hover:bg-blue-50"
          >
            Nạp tiền (VNPay / MoMo)
          </button>
          <button
            type="button"
            onClick={() => {
              if (!getAuthToken()) {
                toast.error('Vui lòng đăng nhập.');
                return;
              }
              setWithdrawOpen(true);
            }}
            className="w-full rounded-xl bg-white/20 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            Rút tiền
          </button>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">lock</span>
              <span className="text-sm font-semibold text-slate-700">Số dư đóng băng (Tiền cọc)</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {formatPrice(balance.pending_balance)} <span className="text-xl font-medium text-slate-500">đ</span>
            </div>
          </div>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
            Tiền ký quỹ cho đơn thuê đang active. Hoàn về số dư khả dụng khi chủ máy hoàn tất đơn.
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500">trending_up</span>
            <span className="text-sm font-semibold text-slate-700">Thống kê thu nhập</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">Tổng đã nhận</span>
              <span className="text-sm font-bold text-emerald-600">+{formatPrice(stats?.total_earned || 0)} đ</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">Phí sàn đã trả</span>
              <span className="text-sm font-bold text-red-500">-{formatPrice(stats?.total_commission_paid || 0)} đ</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Hoàn tiền</span>
              <span className="text-sm font-bold text-slate-700">{formatPrice(stats?.total_refunded || 0)} đ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap gap-2">
          {tabBtn('transactions', 'Lịch sử giao dịch', 'receipt_long')}
          {tabBtn('ledger', 'Sổ cái ví', 'menu_book')}
          {tabBtn('payouts', 'Lệnh rút tiền', 'payments')}
        </div>

        {activeTab === 'transactions' && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {txMeta.total > 0
                  ? `${txMeta.total} giao dịch — trang ${txMeta.page}/${txMeta.totalPages}`
                  : 'Chưa có giao dịch'}
              </p>
              <select
                value={txTypeFilter}
                onChange={(e) => handleTxTypeChange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-[#1a3fc7]"
              >
                {TX_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {txLoading ? (
              <div className="py-12 text-center text-slate-500">Đang tải giao dịch...</div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center text-slate-500">
                <span className="material-symbols-outlined mb-2 text-4xl text-slate-300">receipt_long</span>
                Chưa có giao dịch nào
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const displayPositive = tx.type === 'DEPOSIT' || tx.type === 'REFUND';
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            displayPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {displayPositive ? 'arrow_downward' : 'arrow_upward'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {tx.description || TX_TYPE_LABELS[tx.type] || tx.type}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {TX_TYPE_LABELS[tx.type] || tx.type} · #{shortId(tx.id)} ·{' '}
                            {formatDateTime(tx.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold ${displayPositive ? 'text-emerald-600' : 'text-red-600'}`}
                        >
                          {displayPositive ? '+' : '−'}
                          {formatPrice(Math.abs(tx.amount))} đ
                        </div>
                        <div className="mt-1 text-[11px] font-semibold text-slate-500">
                          {TX_STATUS_LABELS[tx.status] || tx.status}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6">
              <Pagination
                currentPage={txPage}
                totalPages={txMeta.totalPages}
                onPageChange={setTxPage}
              />
            </div>
          </>
        )}

        {activeTab === 'ledger' && (
          <>
            <p className="mb-4 text-sm text-slate-500">
              Sổ cái ghi từng biến động <strong>khả dụng</strong> và <strong>đóng băng</strong> — dùng để đối soát
              audit.
              {ledgerMeta.total > 0 &&
                ` ${ledgerMeta.total} dòng — trang ${ledgerMeta.page}/${ledgerMeta.totalPages}`}
            </p>

            {ledgerLoading ? (
              <div className="py-12 text-center text-slate-500">Đang tải sổ cái...</div>
            ) : ledger.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center text-slate-500">
                <span className="material-symbols-outlined mb-2 text-4xl text-slate-300">menu_book</span>
                Chưa có dòng sổ cái
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-3">Thời gian</th>
                      <th className="px-3 py-3">Loại</th>
                      <th className="px-3 py-3">Số tiền</th>
                      <th className="px-3 py-3">Khả dụng</th>
                      <th className="px-3 py-3">Đóng băng</th>
                      <th className="px-3 py-3">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((row) => {
                      const isCredit = row.direction === 'CREDIT';
                      const bucketLabel = row.bucket === 'PENDING' ? 'Đóng băng' : 'Khả dụng';
                      return (
                        <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">
                            {formatDateTime(row.created_at)}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                                isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {isCredit ? 'Cộng' : 'Trừ'} · {bucketLabel}
                            </span>
                          </td>
                          <td
                            className={`px-3 py-3 font-bold ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}
                          >
                            {isCredit ? '+' : '−'}
                            {formatPrice(row.amount)} đ
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-600">
                            {formatPrice(row.available_before)} →{' '}
                            <strong className="text-slate-800">{formatPrice(row.available_after)}</strong>
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-600">
                            {formatPrice(row.pending_before)} →{' '}
                            <strong className="text-slate-800">{formatPrice(row.pending_after)}</strong>
                          </td>
                          <td className="max-w-[200px] truncate px-3 py-3 text-xs text-slate-500" title={row.note || ''}>
                            {row.note || '—'}
                            {(row.booking_id || row.booking_group_id) && (
                              <span className="mt-0.5 block text-[10px] text-slate-400">
                                {row.booking_id && `Đơn #${shortId(row.booking_id)}`}
                                {row.booking_group_id && ` · Nhóm #${shortId(row.booking_group_id)}`}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6">
              <Pagination
                currentPage={ledgerPage}
                totalPages={ledgerMeta.totalPages}
                onPageChange={setLedgerPage}
              />
            </div>
          </>
        )}

        {activeTab === 'payouts' && (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {payoutMeta.total > 0
                ? `${payoutMeta.total} lệnh rút — trang ${payoutMeta.page}/${payoutMeta.totalPages}`
                : 'Chưa có yêu cầu rút tiền'}
            </p>

            {payoutLoading ? (
              <div className="py-12 text-center text-slate-500">Đang tải lệnh rút...</div>
            ) : payouts.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center text-slate-500">
                <span className="material-symbols-outlined mb-2 text-4xl text-slate-300">payments</span>
                Chưa có yêu cầu rút tiền nào
              </div>
            ) : (
              <div className="space-y-3">
                {payouts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">{formatPrice(p.amount)} đ</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {p.bank_name || 'Ngân hàng'} · ****{p.bank_account?.slice(-4) || '—'}
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400">#{shortId(p.id)} · {formatDateTime(p.created_at)}</div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                        p.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700'
                          : p.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {PAYOUT_STATUS_LABELS[p.status] || p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <Pagination
                currentPage={payoutPage}
                totalPages={payoutMeta.totalPages}
                onPageChange={setPayoutPage}
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-[#1a3fc7] p-6 text-white shadow-lg">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <span className="material-symbols-outlined text-amber-400">shield</span>
          Quy trình ký quỹ an toàn
        </h3>
        <p className="text-sm leading-relaxed text-slate-200">
          Khi chủ máy duyệt đơn, tiền thuê + phí sàn (và cọc nền tảng nếu có) được trừ từ số dư khả dụng hoặc chuyển
          sang đóng băng. Mọi biến động đều được ghi vào <strong className="text-white">Sổ cái ví</strong> để bạn
          tra cứu.
        </p>
      </div>

      <WalletTopupModal open={topupOpen} onClose={() => setTopupOpen(false)} />
      <WalletWithdrawModal
        open={withdrawOpen}
        maxAmount={balance.available_balance}
        onClose={() => setWithdrawOpen(false)}
        onSubmit={handleWithdrawSubmit}
      />
    </div>
  );
}
