import { Link } from 'react-router-dom';

const orders = [
  {
    id: 'LL-2024-1088',
    status: 'pending',
    statusLabel: 'Đang chờ xác nhận',
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop',
    product: 'Sony Alpha A7 IV + FE 24-70mm GM II',
    owner: 'Hoàng Nam Photo',
    rentalDate: '15/10/2024 - 18/10/2024',
    total: '2.625.000đ',
  },
  {
    id: 'LL-2024-1072',
    status: 'active',
    statusLabel: 'Đang thuê',
    image:
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1200&auto=format&fit=crop',
    product: 'Canon EOS R6 + RF 24-105mm',
    owner: 'Studio Minh Đức',
    rentalDate: '10/10/2024 - 12/10/2024',
    total: '1.850.000đ',
  },
  {
    id: 'LL-2024-1020',
    status: 'completed',
    statusLabel: 'Hoàn tất',
    image:
      'https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=1200&auto=format&fit=crop',
    product: 'DJI RS3 Pro Combo',
    owner: 'Huy Cinema',
    rentalDate: '01/10/2024 - 03/10/2024',
    total: '950.000đ',
  },
];

const statusStyles: Record<
  string,
  {
    bg: string;
    text: string;
  }
> = {
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
  },
  active: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
};

export default function BookingHistoryPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xl font-extrabold text-[#0b45b3]"
            >
              LensLease VN
            </Link>

            <div className="hidden h-6 w-px bg-gray-200 md:block" />

            <div className="hidden text-sm font-medium text-gray-500 md:block">
              Lịch sử đơn thuê
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-[#0b45b3]">
              H
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* TITLE */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Lịch sử đơn thuê
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Theo dõi trạng thái và quản lý các đơn thuê thiết bị của bạn.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#0b45b3] px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            Thuê thiết bị mới
          </Link>
        </div>

        {/* FILTER */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button className="rounded-full bg-[#0b45b3] px-5 py-2 text-sm font-semibold text-white">
            Tất cả
          </button>

          <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50">
            Đang chờ
          </button>

          <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50">
            Đang thuê
          </button>

          <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50">
            Hoàn tất
          </button>
        </div>

        {/* ORDERS */}
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-5 lg:flex-row">
                {/* IMAGE */}
                <img
                  src={order.image}
                  alt={order.product}
                  className="h-48 w-full rounded-2xl object-cover lg:h-40 lg:w-56"
                />

                {/* INFO */}
                <div className="flex flex-1 flex-col">
                  {/* TOP */}
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                          statusStyles[order.status].bg
                        } ${statusStyles[order.status].text}`}
                      >
                        {order.statusLabel}
                      </div>

                      <h2 className="mt-3 text-2xl font-bold text-gray-900">
                        {order.product}
                      </h2>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span>
                          Mã đơn:{' '}
                          <span className="font-semibold text-gray-700">
                            {order.id}
                          </span>
                        </span>

                        <span>•</span>

                        <span>
                          Chủ thiết bị:{' '}
                          <span className="font-semibold text-[#0b45b3]">
                            {order.owner}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gray-50 px-5 py-4 text-left md:min-w-[180px] md:text-right">
                      <div className="text-xs font-medium text-gray-500">
                        Tổng thanh toán
                      </div>

                      <div className="mt-1 text-2xl font-extrabold text-[#0b45b3]">
                        {order.total}
                      </div>
                    </div>
                  </div>

                  {/* DATE */}
                  <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-[18px]">
                      calendar_month
                    </span>

                    {order.rentalDate}
                  </div>

                  {/* ACTION */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to={`/booking/${order.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:border-[#0b45b3] hover:bg-blue-50 hover:text-[#0b45b3]"
                    >
                      Xem chi tiết
                    </Link>

                    <button className="rounded-xl bg-[#0b45b3] px-5 py-3 font-semibold text-white transition hover:bg-blue-800">
                      Liên hệ chủ thiết bị
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {/* 
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <span className="material-symbols-outlined text-[40px]">
              inventory_2
            </span>
          </div>

          <h3 className="mt-6 text-2xl font-bold text-gray-900">
            Chưa có đơn thuê nào
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Hãy bắt đầu thuê thiết bị đầu tiên của bạn.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-[#0b45b3] px-6 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Khám phá thiết bị
          </Link>
        </div>
        */}
      </main>
    </div>
  );
}