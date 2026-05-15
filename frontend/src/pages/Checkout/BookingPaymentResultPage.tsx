import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function BookingPaymentResultPage() {
  const [params] = useSearchParams();
  const ok = useMemo(() => params.get('ok') === '1', [params]);
  const groupId = params.get('groupId') || '';
  const msgRaw = params.get('msg') || '';
  const msg = useMemo(() => {
    if (!msgRaw) return '';
    try {
      return decodeURIComponent(msgRaw);
    } catch {
      return msgRaw;
    }
  }, [msgRaw]);

  return (
    <div className="min-h-[50vh] bg-[#f4f7fa] py-12">
      <div className="mx-auto max-w-lg px-4">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div
            className={`h-1 w-full ${ok ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'}`}
          />
          <div className="px-8 py-10 text-center">
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                ok ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'
              }`}
            >
              <span className="material-symbols-outlined text-[36px]">{ok ? 'check_circle' : 'error'}</span>
            </div>
            <h1 className="text-xl font-extrabold text-gray-900">
              {ok ? 'Thanh toán VNPay thành công' : 'Thanh toán chưa hoàn tất'}
            </h1>
            {groupId ? (
              <p className="mt-2 text-sm text-gray-600">
                Nhóm đơn: <span className="font-mono font-bold text-[#0b45b3]">#{groupId.replace(/-/g, '').slice(0, 8).toUpperCase()}</span>
              </p>
            ) : null}
            <p className="mt-4 text-sm text-gray-600">
              {ok
                ? 'Số tiền đã được cộng vào ví ký quỹ của bạn và nhóm đơn được đánh dấu đã thanh toán online. Khi chủ máy duyệt, hệ thống sẽ trừ ví như thường — hãy giữ đủ số dư.'
                : 'Bạn có thể thử lại từ trang kết quả đặt thuê (nếu còn mở) hoặc thanh toán sau qua trang Ví / lịch sử đơn.'}
            </p>
            {msg ? <p className="mt-3 text-xs text-gray-500 break-words">{msg}</p> : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/wallet"
                className="inline-flex items-center justify-center rounded-xl bg-[#0b45b3] px-6 py-3 text-sm font-bold text-white hover:bg-blue-800"
              >
                Mở ví ký quỹ
              </Link>
              <Link
                to="/history"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50"
              >
                Đơn thuê
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
