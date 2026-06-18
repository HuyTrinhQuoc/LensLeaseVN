import { useState } from 'react';
import { redirectBookingGroupPayment } from '../../utils/booking-group-payment';

const VNPAY_LOGO_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAVztuTczylvs5j_Yqd_nneg23zDdg0wSmcMzApHUxGA&s&ec=121691717';

type Props = {
  groupId: string;
  compact?: boolean;
};

/** Nút thanh toán lại VNPay cho nhóm đơn (PENDING). */
export default function BookingGroupVnpayButton({ groupId, compact }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handlePay = async () => {
    setErr('');
    setBusy(true);
    try {
      await redirectBookingGroupPayment(groupId, 'VNPAY');
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setErr(msg || (e instanceof Error ? e.message : 'Lỗi thanh toán'));
      setBusy(false);
    }
  };

  if (compact) {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handlePay()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0e4194] bg-[#0e4194] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0c3578] disabled:opacity-60"
        >
          {busy ? (
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
          ) : (
            <img src={VNPAY_LOGO_URL} alt="" className="h-6 w-auto rounded bg-white p-0.5" />
          )}
          Thanh toán VNPay lại
        </button>
        {err ? <span className="text-xs text-red-600">{err}</span> : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
      <p className="mb-3 text-sm text-slate-700">
        Nhóm đơn chưa thanh toán online. Bạn có thể thanh toán qua VNPay để nạp ví và đánh dấu đã thanh toán.
      </p>
      {err ? <p className="mb-2 text-sm text-red-600">{err}</p> : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => void handlePay()}
        className="inline-flex items-center gap-2 rounded-xl bg-[#0e4194] px-5 py-3 text-sm font-bold text-white hover:bg-[#0c3578] disabled:opacity-60"
      >
        {busy ? (
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
        ) : (
          <img src={VNPAY_LOGO_URL} alt="VNPay" className="h-8 w-auto rounded bg-white p-1" />
        )}
        Tiếp tục thanh toán VNPay
      </button>
    </div>
  );
}
