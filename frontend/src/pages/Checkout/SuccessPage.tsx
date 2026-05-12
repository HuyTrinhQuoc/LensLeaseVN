import { Link } from 'react-router-dom';

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fa] text-gray-800">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="text-xl font-extrabold text-[#0b45b3]">
              LensLease VN
            </div>

            <div className="hidden h-6 w-px bg-gray-200 md:block" />

            <div className="hidden text-sm font-medium text-gray-500 md:block">
              Thanh toán thành công
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <span className="material-symbols-outlined text-[18px]">
              verified_user
            </span>
            Giao dịch bảo mật
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* SUCCESS ICON */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-200">
              <span className="material-symbols-outlined text-[40px]">
                check
              </span>
            </div>
          </div>
        </div>

        {/* SUCCESS TEXT */}
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            <span className="material-symbols-outlined text-[18px]">
              verified
            </span>
            Payment Successful
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900">
            Đặt thuê thành công 🎉
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500">
            Yêu cầu thuê thiết bị của bạn đã được ghi nhận và thanh toán thành
            công. Chủ thiết bị sẽ xác nhận đơn thuê trong thời gian sớm nhất.
          </p>
        </div>

        {/* ORDER CARD */}
        <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          {/* TOP */}
          <div className="flex flex-col gap-6 border-b border-gray-100 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">
                Mã đơn thuê
              </div>

              <div className="mt-1 text-2xl font-extrabold text-[#0b45b3]">
                #LL-2024-1088
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Trạng thái
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm font-bold text-blue-900">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Đang chờ chủ thiết bị xác nhận
              </div>
            </div>
          </div>

          {/* PRODUCT */}
          <div className="flex flex-col gap-5 border-b border-gray-100 py-6 md:flex-row">
            <img
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop"
              alt="Camera"
              className="h-28 w-full rounded-2xl object-cover md:w-40"
            />

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                Sony Alpha A7 IV + FE 24-70mm GM II
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>
                  Chủ thiết bị:{' '}
                  <span className="font-semibold text-[#0b45b3]">
                    Hoàng Nam Photo
                  </span>
                </span>

                <span>•</span>

                <span>15/10/2024 → 18/10/2024</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  💾 Thẻ nhớ 128GB
                </div>

                <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  🔭 Chân máy
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT SUMMARY */}
          <div className="space-y-4 py-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Tổng thanh toán
              </span>

              <span className="text-lg font-bold text-gray-900">
                2.625.000đ
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Phương thức thanh toán
              </span>

              <span className="font-semibold text-gray-900">
                VietQR
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Thời gian thanh toán
              </span>

              <span className="font-semibold text-gray-900">
                14:32 • 15/10/2024
              </span>
            </div>
          </div>

          {/* INFO */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <span className="material-symbols-outlined">
                  info
                </span>
              </div>

              <div>
                <h3 className="font-bold text-blue-900">
                  Điều gì xảy ra tiếp theo?
                </h3>

                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-blue-900">
                  <li>
                    • Chủ thiết bị sẽ xác nhận yêu cầu thuê của bạn.
                  </li>

                  <li>
                    • Sau khi xác nhận, bạn sẽ nhận thông tin nhận máy.
                  </li>

                  <li>
                    • LensLease sẽ gửi email + thông báo cập nhật trạng thái.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              to="/history"
              className="flex items-center justify-center rounded-2xl border border-gray-300 py-4 text-lg font-bold text-gray-700 transition hover:border-[#0b45b3] hover:bg-blue-50 hover:text-[#0b45b3]"
            >
              Xem đơn thuê
            </Link>

            <Link
              to="/"
              className="flex items-center justify-center rounded-2xl bg-[#0b45b3] py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800"
            >
              Về trang chủ
            </Link>
          </div>
        </div>

        {/* SUPPORT */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Cần hỗ trợ? Liên hệ{' '}
          <span className="font-semibold text-[#0b45b3]">
            support@lenslease.vn
          </span>
        </div>
      </main>
    </div>
  );
}