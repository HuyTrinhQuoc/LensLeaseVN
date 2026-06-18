import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { paymentService, type TopupChannel } from '../../services/payment.service';

const QUICK_AMOUNTS = [100_000, 200_000, 500_000, 1_000_000, 2_000_000];

const MOMO_PINK = '#a50064';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function WalletTopupModal({ open, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [channel, setChannel] = useState<TopupChannel>('VNPAY');
  const [vnpayOn, setVnpayOn] = useState(false);
  const [momoOn, setMomoOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    void paymentService
      .getGatewayConfig()
      .then((r) => {
        const v = !!r.data?.data?.vnpay;
        const m = !!r.data?.data?.momo;
        setVnpayOn(v);
        setMomoOn(m);
        if (v) setChannel('VNPAY');
        else if (m) setChannel('MOMO');
      })
      .catch(() => {
        setVnpayOn(false);
        setMomoOn(false);
      });
  }, [open]);

  if (!open) return null;

  const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

  const parsedAmount = Number(amount.replace(/\D/g, ''));
  const validAmount = Number.isFinite(parsedAmount) && parsedAmount >= 10_000;

  const handleSubmit = async () => {
    if (!validAmount) {
      setError('Số tiền tối thiểu 10.000đ');
      return;
    }
    if (channel === 'VNPAY' && !vnpayOn) {
      setError('VNPay chưa được cấu hình trên server.');
      return;
    }
    if (channel === 'MOMO' && !momoOn) {
      setError('MoMo chưa được cấu hình trên server.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await paymentService.createWalletTopup(parsedAmount, channel);
      const url = res.data?.data?.paymentUrl;
      if (!url) {
        setError('Không nhận được link thanh toán.');
        setLoading(false);
        return;
      }
      toast.success('Đang chuyển tới cổng thanh toán…');
      window.location.href = url;
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || (err instanceof Error ? err.message : 'Không tạo được thanh toán'));
      setLoading(false);
    }
  };

  const noGateway = !vnpayOn && !momoOn;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="topup-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 id="topup-title" className="text-lg font-bold text-slate-900">
            Nạp tiền vào ví
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {noGateway ? (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Chưa bật cổng thanh toán trên server. Kiểm tra cấu hình VNPay / MoMo trong{' '}
              <code className="text-xs">backend/.env</code>.
            </p>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Số tiền (VNĐ)</label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="Ví dụ: 500000"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold text-slate-900 outline-none focus:border-[#1a3fc7] focus:ring-2 focus:ring-blue-100"
            />
            {validAmount && (
              <p className="mt-1 text-sm text-slate-500">{formatPrice(parsedAmount)} đ</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(String(a))}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#1a3fc7] hover:bg-blue-50"
              >
                {formatPrice(a)}đ
              </button>
            ))}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Cổng thanh toán</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {vnpayOn && (
                <button
                  type="button"
                  onClick={() => setChannel('VNPAY')}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                    channel === 'VNPAY'
                      ? 'border-[#0e4194] bg-blue-50/80'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xs font-extrabold text-[#0e4194] shadow-sm ring-1 ring-slate-100">
                    VN
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">VNPay</div>
                    <div className="text-xs text-slate-500">Thẻ / QR ngân hàng</div>
                  </div>
                </button>
              )}
              {momoOn && (
                <button
                  type="button"
                  onClick={() => setChannel('MOMO')}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                    channel === 'MOMO'
                      ? 'border-[#a50064] bg-pink-50/80'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-extrabold text-white shadow-sm"
                    style={{ backgroundColor: MOMO_PINK }}
                  >
                    Mo
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">MoMo</div>
                    <div className="text-xs text-slate-500">Ví điện tử MoMo</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700">{error}</p>
          )}

          <p className="text-xs leading-relaxed text-slate-500">
            Bạn sẽ được chuyển sang trang thanh toán an toàn. Sau khi thành công, số dư ví cập nhật trong vài giây.
          </p>
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={loading || noGateway || !validAmount}
            onClick={() => void handleSubmit()}
            className="flex-1 rounded-xl bg-[#1a3fc7] py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Đang xử lý…' : 'Tiếp tục thanh toán'}
          </button>
        </div>
      </div>
    </div>
  );
}
