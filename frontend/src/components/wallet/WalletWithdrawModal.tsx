import { useState } from 'react';

type Props = {
  open: boolean;
  maxAmount: number;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
};

export default function WalletWithdrawModal({ open, maxAmount, onClose, onSubmit }: Props) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n);
  const parsed = Number(amount.replace(/\D/g, ''));
  const valid = Number.isFinite(parsed) && parsed >= 10_000 && parsed <= maxAmount;

  const handleSubmit = async () => {
    if (!valid) {
      setError(
        parsed > maxAmount
          ? 'Vượt quá số dư khả dụng'
          : 'Số tiền tối thiểu 10.000đ',
      );
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit(parsed);
      onClose();
      setAmount('');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || (err instanceof Error ? err.message : 'Lỗi rút tiền'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Rút tiền về tài khoản</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <p className="text-sm text-slate-600">
            Số dư khả dụng: <strong>{formatPrice(maxAmount)}đ</strong>
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="Nhập số tiền muốn rút"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold outline-none focus:border-[#1a3fc7]"
          />
          <button
            type="button"
            onClick={() => setAmount(String(maxAmount))}
            className="text-xs font-semibold text-[#1a3fc7] underline"
          >
            Rút tối đa
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-slate-500">Yêu cầu cần được quản trị viên duyệt trước khi chuyển khoản.</p>
        </div>
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-3 text-sm font-bold text-slate-700">
            Hủy
          </button>
          <button
            type="button"
            disabled={loading || !valid}
            onClick={() => void handleSubmit()}
            className="flex-1 rounded-xl bg-[#1a3fc7] py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? 'Đang gửi…' : 'Gửi yêu cầu rút'}
          </button>
        </div>
      </div>
    </div>
  );
}
