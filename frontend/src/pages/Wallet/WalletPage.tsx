import { useCallback, useEffect, useState } from 'react';
import { getAuthToken } from '../../utils/auth';
import { walletService } from '../../services/wallet.service';

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
}

interface PayoutRow {
  id: string;
  amount: number;
  status: string;
  bank_name: string | null;
  bank_account: string | null;
  created_at: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState<WalletBalance>({
    available_balance: 0,
    pending_balance: 0,
  });
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [, setLedger] = useState<WalletLedgerRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchWalletData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setAuthError('Vui lòng đăng nhập để xem ví ký quỹ.');
      setLoading(false);
      return;
    }
    setAuthError(null);
    setLoading(true);

    try {
      const [balRes, transRes, statsRes, ledgerRes, payoutsRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions({ limit: 10 }),
        walletService.getStats().catch(() => null),
        walletService.getLedger({ limit: 20 }).catch(() => null),
        walletService.getPayouts({ limit: 10 }).catch(() => null),
      ]);

      const balData = balRes.data?.data ?? balRes.data;
      if (balData) {
        setBalance({
          available_balance: Number(balData.available_balance ?? 0),
          pending_balance: Number(balData.pending_balance ?? 0),
        });
      }

      const transPayload = transRes.data as { data?: Transaction[] };
      if (Array.isArray(transPayload?.data)) {
        setTransactions(
          transPayload.data.map((tx: Transaction) => ({
            ...tx,
            amount: Number(tx.amount),
          })),
        );
      }

      if (statsRes?.data?.data) {
        const s = statsRes.data.data as WalletStats;
        setStats({
          total_earned: Number(s.total_earned ?? 0),
          total_commission_paid: Number(s.total_commission_paid ?? 0),
          total_refunded: Number(s.total_refunded ?? 0),
        });
      }

      const ledPayload = ledgerRes?.data as { data?: WalletLedgerRow[] } | undefined;
      if (Array.isArray(ledPayload?.data)) {
        setLedger(
          ledPayload.data.map((r: WalletLedgerRow) => ({
            ...r,
            amount: Number(r.amount),
            available_before: Number(r.available_before),
            available_after: Number(r.available_after),
            pending_before: Number(r.pending_before),
            pending_after: Number(r.pending_after),
          })),
        );
      }

      const poPayload = payoutsRes?.data as { data?: PayoutRow[] } | undefined;
      if (Array.isArray(poPayload?.data)) {
        setPayouts(
          poPayload.data.map((p: PayoutRow) => ({
            ...p,
            amount: Number(p.amount),
          })),
        );
      }
    } catch (err: unknown) {
      console.error('Wallet fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWalletData();
  }, [fetchWalletData]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const handleWithdraw = async () => {
    const token = getAuthToken();
    if (!token) {
      alert('Vui lòng đăng nhập.');
      return;
    }

    const amountStr = window.prompt(
      `Nhập số tiền muốn rút (Tối đa: ${formatPrice(balance.available_balance)}đ):`,
    );
    if (!amountStr) return;

    const amount = Number(amountStr.replace(/\D/g, ''));
    if (isNaN(amount) || amount < 10000) {
      alert('Số tiền rút không hợp lệ (Tối thiểu 10,000đ)');
      return;
    }
    if (amount > balance.available_balance) {
      alert('Số dư khả dụng không đủ!');
      return;
    }

    try {
      await walletService.withdraw(amount);
      alert('Tạo yêu cầu rút tiền thành công! Vui lòng chờ quản trị viên duyệt.');
      await fetchWalletData();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      alert(msg || (err instanceof Error ? err.message : 'Lỗi rút tiền'));
    }
  };

  const handleDeposit = async () => {
    const token = getAuthToken();
    if (!token) {
      alert('Vui lòng đăng nhập.');
      return;
    }
    const amountStr = window.prompt('Số tiền nạp vào ví (VNĐ):');
    if (amountStr == null || amountStr.trim() === '') return;
    const amount = Number(amountStr.replace(/\D/g, ''));
    if (!Number.isFinite(amount) || amount < 1) {
      alert('Số tiền không hợp lệ (tối thiểu 1đ).');
      return;
    }
    try {
      await walletService.deposit(amount, 'Nạp tiền từ ứng dụng');
      alert('Nạp tiền thành công.');
      await fetchWalletData();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      alert(msg || (err instanceof Error ? err.message : 'Lỗi nạp tiền'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 font-medium">Đang tải ví...</p>
      </div>
    );
  }

  if (authError && !getAuthToken()) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <p className="text-gray-600">{authError}</p>
        <a href="/login" className="px-6 py-2 bg-[#1a3fc7] text-white rounded-xl font-bold">
          Đăng nhập
        </a>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight mb-1">
            Ví của tôi
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Quản lý số dư, tiền cọc và lịch sử giao dịch của bạn.
          </p>
        </div>
        <button
          onClick={() => void fetchWalletData()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Làm mới
        </button>
      </div>

      {/* 3 CARDS TOP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Card 1: Available Balance */}
        <div className="bg-[#1a3fc7] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-white/80">account_balance_wallet</span>
            <span className="font-semibold text-white/90 text-sm">Số dư khả dụng</span>
          </div>
          <div className="text-3xl font-extrabold mb-4">
            {formatPrice(balance.available_balance)} <span className="text-xl font-medium">đ</span>
          </div>

          <p className="mb-4 text-[11px] leading-relaxed text-white/75">
            Nạp qua cổng thanh toán (VNPay) có thể thực hiện sau bước <strong className="text-white">đặt thuê</strong>{' '}
            (trang xác nhận đơn). Tại đây bạn có thể nạp nhanh qua ví nội bộ hoặc rút tiền.
          </p>

          <button
            type="button"
            onClick={handleWithdraw}
            className="mb-2 w-full bg-white/20 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30 rounded-xl"
          >
            Rút tiền
          </button>
          <button
            type="button"
            onClick={handleDeposit}
            className="w-full text-center text-[11px] font-medium text-white/85 underline decoration-white/40 underline-offset-2 hover:text-white"
          >
            Nạp tiền vào ví
          </button>
        </div>

        {/* Card 2: Frozen Balance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">lock</span>
                <span className="font-semibold text-slate-700 text-sm">Số dư đóng băng (Tiền cọc)</span>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {formatPrice(balance.pending_balance)} <span className="text-xl font-medium text-slate-500">đ</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mt-4 bg-slate-50 p-3 rounded-lg">
            Số tiền này đang được ký quỹ cho các đơn thuê hiện tại. Sẽ được hoàn lại vào Số dư khả dụng khi chủ máy hoàn tất đơn.
          </p>
        </div>

        {/* Card 3: Stats */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-emerald-500">trending_up</span>
            <span className="font-semibold text-slate-700 text-sm">Thống kê thu nhập</span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">Tổng đã nhận</span>
              <span className="text-sm font-bold text-emerald-600">+{formatPrice(stats?.total_earned || 0)} đ</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">Phí sàn đã trả</span>
              <span className="text-sm font-bold text-red-500">-{formatPrice(stats?.total_commission_paid || 0)} đ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Hoàn tiền</span>
              <span className="text-sm font-bold text-slate-700">{formatPrice(stats?.total_refunded || 0)} đ</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left Column: Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Lịch sử giao dịch</h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">10 GD gần nhất</span>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center">
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">receipt_long</span>
              Chưa có giao dịch nào
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => {
                const isPositive = ['DEPOSIT', 'PAYOUT_REFUND', 'PAYOUT_SUCCESS'].includes(tx.type) || tx.amount > 0;
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        <span className="material-symbols-outlined text-[20px]">
                          {isPositive ? 'arrow_downward' : 'arrow_upward'}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{tx.description || tx.type}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          #{tx.id.substring(0, 8).toUpperCase()} • {new Date(tx.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : '-'}{formatPrice(Math.abs(tx.amount))} đ
                      </div>
                      <div className="text-[11px] font-semibold mt-1 text-slate-500">
                        {tx.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Payouts & Process */}
        <div className="space-y-8">

          {/* Lệnh Rút Tiền */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Lệnh rút tiền</h3>
            </div>
            {payouts.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-sm">Chưa có yêu cầu rút tiền nào.</div>
            ) : (
              <div className="space-y-3">
                {payouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{formatPrice(p.amount)} đ</div>
                      <div className="text-xs text-slate-500 mt-1">{p.bank_name || 'Ngân hàng'} • ****{p.bank_account?.slice(-4) || '—'}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-bold ${p.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {p.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">{new Date(p.created_at).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quy Trình Ký Quỹ */}
          <div className="bg-gradient-to-br from-slate-900 to-[#1a3fc7] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400">shield</span>
              Quy trình Ký quỹ An toàn
            </h3>

            <div className="space-y-5 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-amber-400 text-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <div className="font-bold text-sm text-amber-300 mb-1">1. Đặt cọc an toàn</div>
                  <div className="text-xs text-slate-200">Tiền thuê và ký quỹ được tạm giữ khi duyệt đơn. Cọc vào số dư đóng băng.</div>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-emerald-400 text-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <div className="font-bold text-sm text-emerald-300 mb-1">2. Hoàn tiền tức thì</div>
                  <div className="text-xs text-slate-200">Hoàn tất đơn, cọc trả về Số dư khả dụng. Tiền thuê chuyển cho Chủ máy.</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
