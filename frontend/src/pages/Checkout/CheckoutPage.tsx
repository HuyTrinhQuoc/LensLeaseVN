import React from 'react';
import { Link } from 'react-router-dom';
const CheckoutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fa] text-gray-800 antialiased">


      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* STEPPER */}
        <div className="mx-auto mb-10 flex w-full max-w-3xl items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b45b3] text-white">
              ✓
            </div>

            <span className="text-sm font-medium text-gray-800">
              Xác nhận lịch
            </span>
          </div>

          <div className="mx-4 mt-[-20px] h-px flex-1 bg-gray-300" />

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b45b3] text-white">
              ✓
            </div>

            <span className="text-sm font-medium text-gray-800">
              Xác thực CCCD/Khuôn mặt
            </span>
          </div>

          <div className="mx-4 mt-[-20px] h-px flex-1 bg-gray-300" />

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b45b3] font-bold text-white shadow-md shadow-blue-200">
              3
            </div>

            <span className="text-sm font-bold text-[#0b45b3]">
              Thanh toán
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-8">
            {/* PRODUCT */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                Chủ thuê: Hoàng Nam Photo
                <span className="text-blue-500">✔</span>
              </h2>

              <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center">
                <img
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                  alt="Camera"
                  className="h-24 w-24 rounded-lg border border-gray-200 bg-white object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">
                    Sony Alpha A7 IV + FE 24-70mm f/2.8 GM II
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Chủ sở hữu:{' '}
                    <span className="font-medium text-blue-600">
                      Hoàng Nam Photo
                    </span>
                  </p>

                  <div className="mt-1 flex items-center text-xs font-medium text-gray-600">
                    <span className="mr-1 text-yellow-400">★</span>
                    4.9
                    <span className="ml-1 text-gray-400">
                      (128 đánh giá)
                    </span>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-gray-200 sm:pl-4">
                  <p className="mb-1 text-xs font-medium text-gray-500">
                    Thời gian thuê
                  </p>

                  <p className="font-bold text-gray-900">
                    15/10 - 18/10/2024
                  </p>
                </div>
              </div>

              {/* ADDONS */}
              <h4 className="mb-3 text-sm font-bold text-gray-800">
                Phụ kiện chọn thêm
              </h4>

              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50">
                  <input type="checkbox" />

                  <span className="flex items-center gap-2 text-sm font-medium">
                    💾 Thẻ nhớ 128GB
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50">
                  <input type="checkbox" />

                  <span className="flex items-center gap-2 text-sm font-medium">
                    🔭 Chân máy
                  </span>
                </label>
              </div>

                            <div>
                <label className="mt-3 mb-2 block text-sm font-bold text-gray-800">
                  Mã giảm giá chủ thuê
                </label>

                <div className="flex gap-3 ">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá chủ thuê"
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0b45b3]"
                  />

                  <button className="rounded-xl bg-[#0b45b3] px-6 py-3 font-semibold text-white transition hover:bg-blue-800">
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>

            {/* PROMOTION */}
            <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">


              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Mã giảm giá LensLease VN
                </label>

                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá LensLease VN"
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0b45b3]"
                  />

                  <button className="rounded-xl bg-[#0b45b3] px-6 py-3 font-semibold text-white transition hover:bg-blue-800">
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>

            {/* PAYMENT METHODS */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Phương thức thanh toán
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="cursor-pointer rounded-xl border-2 border-[#0b45b3] bg-blue-50 p-4 text-center">
                  <input
                    type="radio"
                    name="payment"
                    className="hidden"
                    defaultChecked
                  />

                  <div className="mb-1 font-bold text-gray-800">
                    VietQR
                  </div>

                  <div className="mb-3 text-xs text-gray-500">
                    (Chuyển khoản nhanh)
                  </div>

                  <div className="text-xl font-extrabold italic text-red-600">
                    Viet<span className="text-blue-800">QR</span>
                  </div>
                </label>

                <label className="cursor-pointer rounded-xl border-2 border-gray-200 p-4 text-center hover:bg-gray-50">
                  <input type="radio" name="payment" className="hidden" />

                  <div className="mb-1 font-bold text-gray-800">
                    Thẻ tín dụng
                  </div>

                  <div className="mb-3 text-xs text-gray-500">
                    (Visa/Master)
                  </div>

                  <div className="flex justify-center gap-2">
                    <div className="flex h-6 w-10 items-center justify-center rounded bg-blue-900 text-[10px] font-bold text-white">
                      VISA
                    </div>

                    <div className="flex h-6 w-10 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      MC
                    </div>
                  </div>
                </label>

                <label className="cursor-pointer rounded-xl border-2 border-gray-200 p-4 text-center hover:bg-gray-50">
                  <input type="radio" name="payment" className="hidden" />

                  <div className="mb-1 font-bold text-gray-800">
                    Ví MoMo
                  </div>

                  <div className="mb-3 text-xs text-transparent">.</div>

                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500 text-xs font-bold text-white">
                    MoMo
                  </div>
                </label>
              </div>
            </div>

            {/* ACTION */}
            <div className="flex items-center justify-between pt-4">
              <a
                href="/verification"
                className="flex items-center gap-2 font-medium text-gray-500 transition hover:text-gray-800"
              >
                ← Quay lại bước xác thực
              </a>

 <Link
  to="/success"
  className="rounded-xl bg-[#0b45b3] px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 inline-flex items-center justify-center"
>
  Xác nhận thanh toán
</Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-gray-900">
                Tóm tắt đơn hàng
              </h3>

              <div className="mb-6 flex gap-3 border-b border-gray-100 pb-6">
                <img
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt="Camera"
                  className="h-16 w-16 rounded-lg border border-gray-200 bg-gray-50 object-cover"
                />

                <div>
                  <h4 className="mb-1 text-sm font-bold leading-tight text-gray-900">
                    Sony Alpha A7 IV + FE 24-70mm f/2.8 GM II
                  </h4>

                  <p className="text-[11px] text-gray-500">
                    Chủ sở hữu:{' '}
                    <span className="font-medium text-blue-600">
                      Hoàng Nam Photo
                    </span>
                  </p>

                  <div className="mt-0.5 text-[11px] text-gray-500">
                    <span className="text-yellow-400">★</span> 4.9
                    (128 đánh giá)
                  </div>
                </div>
              </div>

              <div className="mb-6 space-y-3 border-b border-gray-100 pb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Giá thuê (850.000đ × 3)
                  </span>

                  <span className="font-medium text-gray-900">
                    2.550.000đ
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Phí bảo hiểm thiết bị
                  </span>

                  <span className="font-medium text-gray-900">
                    150.000đ
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Phí dịch vụ LensLease
                  </span>

                  <span className="font-medium text-gray-900">
                    75.000đ
                  </span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-gray-600">
                    Mã giảm giá LensLease VN
                  </span>

                  <span className="font-medium text-red-500">
                    -100.000đ
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Mã giảm giá chủ thuê
                  </span>

                  <span className="font-medium text-red-500">
                    -50.000đ
                  </span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-gray-600">Tiền cọc</span>

                  <span className="font-medium text-gray-900">0đ</span>
                </div>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <span className="font-bold text-gray-900">
                  Tổng thanh toán
                </span>

                <span className="text-2xl font-extrabold text-[#0b45b3]">
                  2.625.000đ
                </span>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <span className="text-blue-600">🛡</span>

                <p className="text-[11px] leading-relaxed text-blue-900">
                  <span className="font-bold">
                    Cam kết LensLease:
                  </span>{' '}
                  Hoàn tiền 100% nếu thiết bị không đúng mô tả hoặc gặp
                  lỗi kỹ thuật.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;