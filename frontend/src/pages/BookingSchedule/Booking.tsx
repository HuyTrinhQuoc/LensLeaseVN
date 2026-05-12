import React from "react";
import { Link } from 'react-router-dom'
const BookingPage: React.FC = () => {
  const addons = [
    {
      id: 1,
      name: "Thẻ nhớ 64GB",
      price: "₫50,000/ngày",
      image:
        "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Chân máy Carbon",
      price: "₫100,000/ngày",
      image:
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Pin dự phòng",
      price: "₫30,000",
      image:
        "https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  const days = [
    "20",
    "31",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans">


      {/* CONTENT */}
      <main className="mx-auto max-w-7xl p-6">
  

        <div className="grid grid-cols-12 gap-5">
          {/* LEFT */}
          <div className="col-span-3 flex flex-col gap-4">
            {/* PRODUCT */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 rounded-xl bg-slate-100 p-4">
                <img
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop"
                  className="h-40 w-full rounded-lg object-cover"
                  alt="camera"
                />
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                Mirrorless Body
              </span>

              <h3 className="mt-3 text-xl font-bold text-slate-800">
                Sony Alpha a7R V
              </h3>

              <div className="mt-1 text-sm font-semibold text-green-600">
                ✓ Verified Equipment
              </div>

              <div className="mt-4 text-2xl font-extrabold text-slate-900">
                ₫1,200,000

                <span className="ml-1 text-sm font-medium text-slate-500">
                  / ngày
                </span>
              </div>
            </div>

            {/* OWNER */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/100"
                  className="h-14 w-14 rounded-full"
                  alt="owner"
                />

                <div>
                  <h4 className="font-bold text-slate-800">
                    Trần Văn A
                  </h4>

                  <div className="text-xs text-slate-500">
                    PROFESSIONAL LENDER
                  </div>

                  <div className="mt-1 text-sm font-semibold text-yellow-500">
                    ★ 4.9

                    <span className="ml-1 font-normal text-slate-500">
                      (128 reviews)
                    </span>
                  </div>
                </div>
              </div>

              <button className="mt-4 w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700">
                Liên hệ
              </button>

              <div className="mt-3 text-center text-xs text-slate-500">
                ⏱ Phản hồi trong 1 giờ
              </div>
            </div>

            {/* LOCATION */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 text-xs font-bold text-slate-500">
                PICKUP LOCATION
              </div>

              <div className="font-semibold text-slate-800">
                Quận 1, TP. Hồ Chí Minh
              </div>

              <div className="mt-1 text-sm text-slate-500">
                Xem địa chỉ chính xác sau khi đặt lịch
              </div>

              <div className="mt-4 overflow-hidden rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop"
                  className="h-28 w-full object-cover"
                  alt="location"
                />
              </div>
            </div>
          </div>

          {/* CENTER */}
          <div className="col-span-5 flex flex-col gap-4">
            {/* CALENDAR */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  Select Dates Calendar
                </h3>

                <div className="flex gap-2">
                  <button className="h-9 w-9 rounded-lg border border-slate-200">
                    ←
                  </button>

                  <button className="h-9 w-9 rounded-lg border border-slate-200">
                    →
                  </button>
                </div>
              </div>

              <div className="mb-5 text-center font-bold text-slate-700">
                October 2023
              </div>

              <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div key={day}>{day}</div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7 place-items-center gap-2">
                {days.map((day, index) => {
                  const isDisabled = index === 0 || index === 1 || index === 7 || index === 8;
                  const isRange = day === "10" || day === "11";
                  const isSelected = day === "14" || day === "15";

                  return (
                    <div
                      key={index}
                      className={`
                        flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-sm font-semibold transition
                        ${isDisabled ? "opacity-30" : ""}
                        ${isRange ? "bg-blue-100 text-blue-600" : ""}
                        ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                            : ""
                        }
                        hover:bg-blue-50
                      `}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  Ngày đang chọn
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-slate-300"></div>
                  Đã được thuê
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-200"></div>
                  Chờ duyệt
                </div>
              </div>
            </div>

            {/* POLICY */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="mb-3 font-bold text-slate-800">
                  Chính sách huỷ
                </h4>

                <ul className="space-y-2 text-sm text-slate-600">
                  <li>Miễn phí huỷ trong 48 giờ</li>
                  <li>Huỷ trước 48h nhận máy</li>
                  <li>Sau 48h phí huỷ 50%</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="mb-3 font-bold text-slate-800">
                  Yêu cầu thuê
                </h4>

                <ul className="space-y-2 text-sm text-slate-600">
                  <li>Xác minh CMND/CCCD</li>
                  <li>Đặt cọc qua ví điện tử</li>
                  <li>Hoặc thẻ tín dụng</li>
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-4 flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-5 text-lg font-bold text-slate-800">
                Tóm tắt chi phí
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    ₫1,200,000 × 4 ngày
                  </span>

                  <span className="font-semibold">
                    ₫4,800,000
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Tiền cọc Escrow
                  </span>

                  <span className="font-semibold">
                    ₫20,000,000
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Phí bảo hiểm thiết bị
                  </span>

                  <span className="font-semibold">
                    ₫250,000
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Phí nền tảng
                  </span>

                  <span className="font-semibold">
                    ₫150,000
                  </span>
                </div>
              </div>

              {/* COUPON */}
              <div className="mt-6">
                <div className="mb-2 font-semibold text-slate-700">
                  Nhập mã giảm giá
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />

                  <button className="rounded-lg bg-slate-100 px-4 font-semibold hover:bg-slate-200">
                    Áp dụng
                  </button>
                </div>
              </div>

              {/* TOTAL */}
              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="font-bold text-slate-800">
                      Tổng thanh toán
                    </div>

                    <div className="text-sm text-slate-500">
                      Bao gồm tất cả phí và thuế
                    </div>
                  </div>

                  <div className="text-3xl font-extrabold text-slate-900">
                    ₫25,200,000
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
  to="/cart"
  className="flex items-center justify-center rounded-xl border border-slate-300 py-4 text-lg font-bold text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
>
  🛒 Giỏ hàng
</Link>

                  <Link to={"/Verification"} className="flex items-center justify-center rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
                    Thanh toán →
                  </Link>
                </div>

                <div className="mt-3 text-center text-xs text-slate-500">
                  Bạn sẽ chưa bị trừ tiền ngay
                </div>
              </div>
            </div>

            {/* ADDONS */}
            <div>
              <h3 className="mb-3 font-bold text-slate-800">
                Recommended Add-ons
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {addons.map((addon) => (
                  <div
                    key={addon.id}
                    className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <img
                      src={addon.image}
                      className="mb-3 h-24 w-full rounded-lg object-cover"
                      alt={addon.name}
                    />

                    <div className="text-sm font-semibold">
                      {addon.name}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      {addon.price}
                    </div>

                    <button className="mt-3 w-full rounded-lg border border-slate-200 py-2 font-semibold hover:bg-slate-50">
                      Thêm
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;