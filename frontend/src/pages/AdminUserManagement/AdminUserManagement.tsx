import React, { useState } from 'react';

// --- Kiểu dữ liệu (Types) ---
interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  status: 'pending' | 'verified' | 'unverified';
  date: string;
  kycId: string;
  dob: string;
  address: string;
}

// --- Dữ liệu mẫu (Mock Data) ---
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn Hoàng',
    email: 'hoang.nv@email.com',
    initials: 'NH',
    role: 'Chủ thiết bị',
    status: 'pending',
    date: '24/10/2023',
    kycId: '079090123456',
    dob: '15/08/1990',
    address: 'Phường Bến Nghé, Quận 1, TP. HCM',
  },
  {
    id: '2',
    name: 'Lê Thị Thanh',
    email: 'thanh.le@email.com',
    initials: 'LT',
    role: 'Người thuê',
    status: 'pending',
    date: '23/10/2023',
    kycId: '079090987654',
    dob: '10/12/1995',
    address: 'Quận Cầu Giấy, Hà Nội',
  },
  {
    id: '3',
    name: 'Trần Văn Duy',
    email: 'duy.tran@email.com',
    initials: 'TD',
    role: 'Chủ thiết bị',
    status: 'verified',
    date: '20/10/2023',
    kycId: '048090112233',
    dob: '05/04/1988',
    address: 'Quận Hải Châu, Đà Nẵng',
  },
];

const AdminUserManagement: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(mockUsers[0]);

  // Render màu trạng thái rực rỡ và rõ ràng hơn
  const renderStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'pending':
        return (
          <div className="inline-flex items-center gap-2 px-3  rounded-md bg-amber-100 text-amber-800 text-sm font-bold border border-amber-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            Chờ duyệt
          </div>
        );
      case 'verified':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-100 text-green-800 text-sm font-bold border border-green-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-600"></div>
            Đã xác minh
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="flex-1 flex overflow-hidden w-full relative bg-background min-h-screen">
      
      {/* --- Cột trái: Bảng danh sách --- */}
      <section className="flex-1 flex flex-col bg-surface-container-lowest min-w-0 md:min-w-[600px]">
        {/* Header & Filters */}
        <div className="px-6 py-6  flex flex-col gap-5">
          <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">Quản lý người dùng</h2>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Bar - Phóng to */}
            <div className="relative flex-1 min-w-[320px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[22px]">search</span>
              <input 
                type="text" 
                placeholder="Tìm kiếm tên, email, CCCD..." 
                className="w-full pl-12 pr-4 py-3 bg-surface  rounded-xl text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
              />
            </div>
            {/* Filters */}
            <select className="px-4 py-3 bg-surface  rounded-xl text-base focus:border-primary outline-none cursor-pointer shadow-sm">
              <option value="">Tất cả vai trò</option>
              <option value="lender">Chủ thiết bị</option>
              <option value="renter">Người thuê</option>
            </select>
            <select className="px-4 py-3 bg-surface  rounded-xl text-base focus:border-primary outline-none cursor-pointer shadow-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt (Pending)</option>
              <option value="verified">Đã xác minh</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface/95 backdrop-blur-md z-10  shadow-sm">
              <tr>
                <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Người dùng</th>
                <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Vai trò</th>
                <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Trạng thái KYC</th>
                <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Ngày đăng ký</th>
                <th className="px-6 py-5 text-sm font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr 
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={` transition-colors cursor-pointer group hover:bg-surface-muted ${selectedUser?.id === user.id ? 'bg-primary/5' : 'bg-surface-container-lowest'}`}
                >
                  {/* Cột User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-base font-extrabold shadow-sm">
                        {user.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-on-surface">{user.name}</span>
                        <span className="text-sm text-outline font-mono mt-0.5">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Cột Vai trò */}
                  <td className="px-6 py-4 text-base font-medium text-on-surface">{user.role}</td>
                  
                  {/* Cột Trạng thái */}
                  <td className="px-6 py-4">
                    {renderStatusBadge(user.status)}
                  </td>
                  
                  {/* Cột Ngày */}
                  <td className="px-6 py-4 text-base text-on-surface-variant font-mono">{user.date}</td>
                  
                  {/* Cột Thao tác */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${selectedUser?.id === user.id ? 'bg-primary text-white shadow-md' : 'hover:bg-surface-container-high text-on-surface-variant'}`}
                        title="Xem hồ sơ KYC"
                      >
                        <span className="material-symbols-outlined text-[22px]" style={selectedUser?.id === user.id ? { fontVariationSettings: "'FILL' 1" } : {}}>visibility</span>
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-error/10 hover:text-error text-outline transition-colors" title="Khóa tài khoản">
                        <span className="material-symbols-outlined text-[22px]">lock</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Cột phải: Duyệt hồ sơ KYC (Tăng size lên w-[480px]) --- */}
      {selectedUser && (
        <aside className="w-[400px] lg:w-[480px] bg-surface flex flex-col shadow-[-8px_0_30px_rgba(0,0,0,0.06)] z-20 transition-all duration-300 transform translate-x-0 hidden md:flex shrink-0">
          
          {/* Header */}
          <div className="px-8 py-6  flex justify-between items-center bg-surface-container-lowest">
            <h3 className="text-xl font-extrabold text-on-surface">Chi tiết hồ sơ KYC</h3>
            <button 
              onClick={() => setSelectedUser(null)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Content Scrollable */}
          <div className="flex-1 overflow-auto p-8 flex flex-col gap-8">
            
            {/* User Info Summary */}
            <div className="flex items-start gap-5 p-5 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-extrabold shadow-md">
                {selectedUser.initials}
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-on-surface leading-tight mb-1">{selectedUser.name}</h4>
                <p className="text-base text-on-surface-variant">Yêu cầu quyền: <span className="font-bold text-primary">{selectedUser.role}</span></p>
                <p className="text-sm font-mono text-outline mt-1.5 bg-surface-container-high px-2 py-0.5 rounded inline-block">ID: LNVN-8842-991</p>
              </div>
            </div>

            {/* Document Viewer */}
            <div className="flex flex-col gap-7">
              {/* Doc 1 */}
              <div className="flex flex-col gap-3">
                <h5 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Căn cước công dân (Mặt trước)</h5>
                <div className="w-full aspect-[1.6/1] bg-surface-container-high rounded-2xl overflow-hidden relative group cursor-zoom-in  hover:border-primary/50 transition-colors">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDSBKBvR9eGoY8zTd_8TAJ0YNl9mcIJ_De4S35XzEmpd8hNQ1tH7SjSV33waaeAg8uo9SUO2NOhEkE7vfYkuSDd-4KWnb3Vtg6l0vSXV9-3blC2rK51k2RSoEufro102pSjjT5SVKGS6uxjjNI_W1oizDhAp6uUNb6YrmrSEA1rBzUl9soOf7DWe8xBgQgYsesrBFHrAhRjGhoG85Cvu9Gs-XT-w18ti43JMj4mcmvfyK9ydiC89qEGvhw9EEMqkZZpNJaKSji9uJM')" }}></div>
                  <div className="absolute inset-0 flex items-center justify-center -z-10 text-outline">
                    <span className="material-symbols-outlined text-5xl opacity-20">badge</span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <span className="material-symbols-outlined text-white text-4xl drop-shadow-md">zoom_in</span>
                  </div>
                </div>
              </div>

              {/* Doc 2 */}
              <div className="flex flex-col gap-3">
                <h5 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Căn cước công dân (Mặt sau)</h5>
                <div className="w-full aspect-[1.6/1] bg-surface-container-high rounded-2xl overflow-hidden relative group cursor-zoom-in  hover:border-primary/50 transition-colors">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD08tCWvI-s7Ze_g67s2Nb9Q4i7n0vgkg50XdG-5YAvDxxJ4lFKb9BZYbdV-keFcoxNesxIQJD6KeN_10ipskb5_eyQ5FxUmIMY9A7fZ6jytFztPN5XB_fCCwJdhCc60q4i6UBLam7qFW1swXfodn8ZSWPpxCa3Yq2qoH7WgSyKel3u5vFEkqUSsz4rRd66pOskPm2OSho_BnDhlBEqQzQjR7o-1MoTCVMgk4BYcIzh8TLc1MUhth798-TM5rTGYHCelAScu69I9mg')" }}></div>
                  <div className="absolute inset-0 flex items-center justify-center -z-10 text-outline">
                    <span className="material-symbols-outlined text-5xl opacity-20">qr_code_2</span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <span className="material-symbols-outlined text-white text-4xl drop-shadow-md">zoom_in</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted Data Check */}
            <div className="bg-surface-container rounded-2xl p-6 ">
              <h5 className="text-base font-extrabold text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-status-success text-[22px]">check_circle</span>
                Dữ liệu OCR trích xuất
              </h5>
              <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                <div>
                  <span className="font-mono text-xs font-bold text-outline uppercase tracking-wider">Số CCCD</span>
                  <p className="text-base text-on-surface font-extrabold mt-1.5">{selectedUser.kycId}</p>
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-outline uppercase tracking-wider">Ngày sinh</span>
                  <p className="text-base text-on-surface font-extrabold mt-1.5">{selectedUser.dob}</p>
                </div>
                <div className="col-span-2 pt-4 ">
                  <span className="font-mono text-xs font-bold text-outline uppercase tracking-wider">Nơi thường trú</span>
                  <p className="text-base text-on-surface font-extrabold mt-1.5 leading-relaxed">{selectedUser.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar (Sticky Bottom) */}
          <div className="p-8  bg-surface-container-lowest flex flex-col gap-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
            {selectedUser.status === 'pending' ? (
              <>
                <button className="w-full py-4 bg-primary text-white text-base font-extrabold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-lg transition-all active:scale-[0.98]">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Phê duyệt KYC
                </button>
                <div className="flex gap-4">
                  <button className="flex-1 py-3.5 border-2 border-error text-error text-base font-bold rounded-xl hover:bg-error/5 transition-colors active:scale-[0.98]">
                    Từ chối
                  </button>
                  <button className="flex-1 py-3.5 border-2 border-primary text-primary text-base font-bold rounded-xl hover:bg-primary/5 transition-colors active:scale-[0.98]">
                    Yêu cầu bổ sung
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full py-4 bg-green-50 text-green-700 text-base font-extrabold rounded-xl flex items-center justify-center gap-2 border-2 border-green-200">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Tài khoản đã được xác minh
              </div>
            )}
          </div>
        </aside>
      )}
    </main>
  );
};

export default AdminUserManagement;