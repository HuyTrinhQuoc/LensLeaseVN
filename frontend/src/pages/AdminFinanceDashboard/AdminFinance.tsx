import React from 'react';

// --- 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU ---

interface SummaryData {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  amount: string;
  subtitle: React.ReactNode;
}

interface PayoutRequest {
  id: string;
  partnerName: string;
  partnerId: string;
  amount: string;
  bankInfo: string;
  statusText: string;
  statusBg: string;
  statusColor: string;
  isPending: boolean;
}

interface Transaction {
  id: string;
  title: string;
  time: string;
  amount: string;
  type: 'income' | 'expense';
}

// --- 2. DỮ LIỆU MẪU (MOCK DATA) ---

const SUMMARY_DATA: SummaryData[] = [
  {
    id: '1',
    title: 'Ví Hệ Thống',
    icon: 'account_balance_wallet',
    iconColor: 'text-primary',
    amount: '425,500,000',
    subtitle: (
      <span className="flex items-center gap-1 text-status-success">
        <span className="material-symbols-outlined text-[14px]">trending_up</span>
        +12% so với tháng trước
      </span>
    )
  },
  {
    id: '2',
    title: 'Hoa Hồng Đã Thu',
    icon: 'pie_chart',
    iconColor: 'text-primary',
    amount: '84,200,000',
    subtitle: <span className="text-on-surface-variant">Tháng hiện tại (VND)</span>
  },
  {
    id: '3',
    title: 'Tiền Cọc Đang Giữ',
    icon: 'lock',
    iconColor: 'text-status-warning',
    amount: '1,240,000,000',
    subtitle: <span className="text-on-surface-variant">Đảm bảo thiết bị (VND)</span>
  }
];

const PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: '1',
    partnerName: 'Nguyễn Văn A',
    partnerId: 'LND-8492',
    amount: '15,000,000',
    bankInfo: 'Vietcombank - 1012345678',
    statusText: 'Chờ duyệt',
    statusBg: 'bg-[#FFF4CE]',
    statusColor: 'text-[#8A6D3B]',
    isPending: true
  },
  {
    id: '2',
    partnerName: 'Trần Thị B (Pro Studio)',
    partnerId: 'LND-3321',
    amount: '42,500,000',
    bankInfo: 'Techcombank - 1903344556',
    statusText: 'Đang xử lý',
    statusBg: 'bg-[#E1F0FF]',
    statusColor: 'text-[#0056D2]',
    isPending: false
  }
];

const TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    title: 'Thu tiền thuê - Booking #BK-992',
    time: 'Hôm nay, 10:45 AM',
    amount: '+ 2,500,000',
    type: 'income'
  },
  {
    id: '2',
    title: 'Giải ngân rút tiền - LND-221',
    time: 'Hôm qua, 15:30 PM',
    amount: '- 18,000,000',
    type: 'expense'
  }
];

// --- 3. COMPONENT CHÍNH ---

export default function AdminFinance() {
  return (
    // Đã thay đổi: Chuyển sang flex-col với gap-8 để kiểm soát khoảng cách tổng thể tốt hơn
    <main className="w-full max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-8 text-on-surface">
      
      {/* Page Header */}
      <div>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-2">Tài Chính & Thanh Toán</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Quản lý dòng tiền, hoa hồng và phê duyệt rút tiền cho đối tác.
        </p>
      </div>

      {/* Financial Summary Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUMMARY_DATA.map((item) => (
          <div 
            key={item.id} 
            // Đã thay đổi: Dùng p-6 thay vì p-container-padding để khung đều đặn
            className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow min-h-[140px]"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                {item.title}
              </span>
              <span 
                className={`material-symbols-outlined ${item.iconColor}`} 
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {item.icon}
              </span>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">{item.amount}</div>
              <div className="font-data-mono text-sm">
                {item.subtitle}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Payout Requests */}
      <section className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col">
        {/* Đã thay đổi: Dùng p-6 cho Header của bảng */}
        <div className="p-6 flex justify-between items-center bg-surface-bright">
          <h3 className="font-headline-sm text-headline-sm font-semibold">Yêu Cầu Rút Tiền</h3>
          <button className="font-label-md text-label-md text-primary flex items-center gap-1 hover:underline">
            Xem tất cả <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="glass-header sticky top-0 bg-surface-container-lowest z-10">
              <tr>
                {/* Đã thay đổi: Căn lề padding py-4 px-6 đồng nhất cho th và td */}
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant">Đối tác / Chủ cho thuê</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant">Số tiền (VND)</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant">Thông tin Ngân hàng</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant">Trạng thái</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md">
              {PAYOUT_REQUESTS.map((req) => (
                <tr key={req.id} className="hover:bg-surface-muted transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-medium">{req.partnerName}</div>
                    <div className="font-data-mono text-[11px] text-on-surface-variant mt-1">ID: {req.partnerId}</div>
                  </td>
                  <td className="py-4 px-6 font-data-mono font-medium">{req.amount}</td>
                  <td className="py-4 px-6 text-on-surface-variant">
                    <div>{req.bankInfo}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 ${req.statusBg} ${req.statusColor} px-2.5 py-1 rounded-full font-label-md text-[11px]`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-current`}></span> {req.statusText}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {req.isPending ? (
                        <>
                          <button className="font-label-md text-on-surface-variant hover:text-error transition-colors">Từ chối</button>
                          <button className="font-label-md bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-[#004bb8] shadow-sm transition-colors">Duyệt chi</button>
                        </>
                      ) : (
                        <button className="font-label-md text-on-surface-variant hover:text-primary transition-colors">Chi tiết</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transaction History */}
      <section className="bg-surface-container-lowest rounded-xl p-6">
        <h3 className="font-headline-sm text-headline-sm font-semibold mb-5">Lịch Sử Giao Dịch Gần Đây</h3>
        <div className="flex flex-col gap-3">
          {TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="flex justify-between items-center p-3 px-4 hover:bg-surface-muted rounded-xl transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-[#E6F4EA] text-status-success' : 'bg-[#FCE8E8] text-status-error'}`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {tx.type === 'income' ? 'arrow_downward' : 'arrow_upward'}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{tx.title}</div>
                  <div className="font-data-mono text-[12px] text-on-surface-variant mt-1">{tx.time}</div>
                </div>
              </div>
              <div className={`font-data-mono font-bold ${tx.type === 'income' ? 'text-status-success' : 'text-on-surface'}`}>
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </section>
      
    </main>
  );
}