import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function WalletTopupResultPage() {
  const [params] = useSearchParams();
  const ok = useMemo(() => params.get('ok') === '1', [params]);
  const gateway = params.get('gateway') || '';
  const msgRaw = params.get('msg') || '';
  const msg = useMemo(() => {
    if (!msgRaw) return '';
    try {
      return decodeURIComponent(msgRaw);
    } catch {
      return msgRaw;
    }
  }, [msgRaw]);

  const gatewayLabel =
    gateway === 'vnpay' ? 'VNPay' : gateway === 'momo' ? 'MoMo' : gateway || 'Cổng thanh toán';

  return (
    <div className="min-h-[60vh] bg-[#f8fafc] py-12">
      <div className="mx-auto max-w-lg px-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div
            className={`h-1.5 w-full ${ok ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'}`}
          />
          <div className="px-8 py-10 text-center">
            <div
              className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-inner ${
                ok ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'
              }`}
            >
              <span className="material-symbols-outlined text-[40px] leading-none">
                {ok ? 'check_circle' : 'error'}
              </span>
            </div>
            <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900">
              {ok ? 'Nạp ví thành công' : 'Thanh toán chưa hoàn tất'}
            </h1>
            <p className="mb-1 text-sm text-slate-600">
              Cổng: <span className="font-bold text-slate-800">{gatewayLabel}</span>
            </p>
            {msg ? (
              <p className="mb-8 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600 break-words">
                {msg}
              </p>
            ) : (
              <p className="mb-8 text-sm leading-relaxed text-slate-500">
                {ok
                  ? 'Số dư ví đã được cập nhật (hoặc đang xử lý trong vài giây). Bạn có thể mở trang Ví và bấm làm mới để xem số dư mới nhất.'
                  : 'Bạn có thể thử nạp lại từ trang Ví. Nếu tiền đã bị trừ mà ví chưa tăng, vui lòng giữ biên lai và liên hệ hỗ trợ kèm mã giao dịch.'}
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/wallet"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3fc7] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                Về Ví
              </Link>
              <Link
                to="/dashboard/wallet"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                Ví trong Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
