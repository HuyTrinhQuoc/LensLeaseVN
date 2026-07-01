import React, { useState } from 'react';
import { useDeviceSchedule, type ScheduleEvent } from '../../hooks/useScheduleData'; 

export default function DeviceSchedulePage() {
  const { 
    equipments, rawEquipmentsLength, selectedEqId, setSelectedEqId, 
    events, loading, 
    searchTerm, setSearchTerm,
    currentDate, setCurrentDate, 
    blockDates, unblockDate // Lấy thêm unblockDate từ hook ra
  } = useDeviceSchedule();

  const selectedEq = equipments.find((eq) => eq.id === selectedEqId);

  // State Modal Khóa lịch
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('');

  // State Modal Mở khóa lịch
  const [unblockTarget, setUnblockTarget] = useState<ScheduleEvent | null>(null);

  // Lấy ngày hôm nay để chặn chọn ngày quá khứ
  const todayISO = new Date().toISOString().split('T')[0];
  const todayTimestamp = new Date().setHours(0,0,0,0);

  // Hàm tính toán ngày trong tháng
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const firstDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Submit Khóa
  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockStart || !blockEnd) return alert("Vui lòng chọn ngày đầy đủ");
    await blockDates(blockStart, blockEnd, blockReason);
    setShowBlockModal(false);
    setBlockStart(''); setBlockEnd(''); setBlockReason('');
  };

  // Submit Mở khóa
  const handleUnblockSubmit = async () => {
    if (!unblockTarget) return;
    await unblockDate(unblockTarget.id);
    setUnblockTarget(null);
  };

  return (
    <main className="">
      <div className="pdb-content">
        {loading ? (
          <div className="pdb-orders__loading text-center py-10">
            <span className="material-symbols-outlined animate-spin text-4xl mb-2">autorenew</span>
            <p>Đang tải dữ liệu lịch trình...</p>
          </div>
        ) : rawEquipmentsLength === 0 ? (
          <div className="pdb-orders__empty text-center py-10">
            <span className="material-symbols-outlined pdb-orders__empty-icon text-6xl">inventory_2</span>
            <h3>Bạn chưa có thiết bị nào</h3>
            <p>Hãy thêm thiết bị để bắt đầu quản lý lịch cho thuê nhé.</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Cột trái: DANH SÁCH THIẾT BỊ VÀ TÌM KIẾM */}
            <div className="w-full lg:w-1/3 bg-white p-5 rounded-[14px] shadow-sm border border-[#e8ecf2] h-fit">
              <h2 className="text-[16px] font-bold text-[#1e293b] mb-3">Kho thiết bị ({rawEquipmentsLength})</h2>
              
              <div className="mb-4 relative">
                <input 
                  type="text" 
                  placeholder="Tìm thiết bị..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-gray-400 text-[20px]">search</span>
              </div>

              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
                {equipments.map((eq) => (
                  <button
                    key={eq.id}
                    onClick={() => setSelectedEqId(eq.id)}
                    className={`flex items-center gap-4 p-3 rounded-[10px] border text-left transition-all ${
                      selectedEqId === eq.id 
                        ? 'border-[#1a3fc7] bg-[#e8edfb] ring-1 ring-[#1a3fc7]' 
                        : 'border-[#e8ecf2] hover:bg-[#f5f7fb]'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {eq.thumbnail ? (
                        <img src={eq.thumbnail} alt={eq.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-gray-400">camera</span>
                      )}
                    </div>
                    <h3 className={`font-semibold text-[13.5px] line-clamp-2 ${selectedEqId === eq.id ? 'text-[#1a3fc7]' : 'text-[#1e293b]'}`}>
                      {eq.title}
                    </h3>
                  </button>
                ))}
              </div>
            </div>

            {/* Cột phải: LƯỚI LỊCH (CALENDAR) */}
            <div className="w-full lg:w-2/3 bg-white p-6 rounded-[14px] shadow-sm border border-[#e8ecf2]">
              <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1e293b]">{selectedEq?.title}</h2>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded text-gray-600"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
                    <p className="text-sm font-semibold text-gray-700 w-[120px] text-center">Tháng {month + 1}, {year}</p>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded text-gray-600"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[12.5px] font-medium">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span> Khách thuê</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> Đã khóa</div>
                  <button 
                    onClick={() => setShowBlockModal(true)}
                    className="ml-auto bg-[#1e293b] text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
                  >
                    + Khóa lịch
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[13px] font-bold text-[#64748b]">
                <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[85px] p-2 bg-gray-50/50 rounded-[10px] border border-transparent"></div>
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dateNum = i + 1;
                  const currentDateString = new Date(year, month, dateNum).setHours(0,0,0,0);
                  
                  // Check xem ngày này có phải ngày quá khứ không
                  const isPast = currentDateString < todayTimestamp;

                  const dayEvent = events.find((ev) => {
                    const start = new Date(ev.start_date).setHours(0,0,0,0);
                    const end = new Date(ev.end_date).setHours(0,0,0,0);
                    return currentDateString >= start && currentDateString <= end;
                  });

                  const isBooked = dayEvent?.type === 'BOOKING';
                  const isBlocked = dayEvent?.type === 'BLOCKED';

                  return (
                    <div
                      key={dateNum}
                      className={`min-h-[85px] p-2 rounded-[10px] border flex flex-col transition-all ${
                        isBooked ? 'bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8]' :
                        isBlocked ? 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]' :
                        isPast ? 'bg-gray-50 border-gray-100 text-gray-400 opacity-60' : // Làm mờ ngày cũ
                        'bg-white border-[#e8ecf2] text-[#64748b] hover:bg-[#f5f7fb]'
                      }`}
                    >
                      <span className="text-right font-bold text-[13px] mb-1">{dateNum}</span>
                      {dayEvent && (
                        <div 
                          // Nếu là lịch khóa, cho phép click để văng popup mở khóa
                          onClick={() => isBlocked ? setUnblockTarget(dayEvent) : null}
                          className={`text-[10px] px-1.5 py-1 rounded-[6px] mt-auto truncate font-semibold ${
                            isBooked ? 'bg-[#dbeafe] text-[#1e40af] cursor-not-allowed' : 
                            'bg-[#fee2e2] text-[#991b1b] cursor-pointer hover:bg-red-200'
                          }`}
                          title={isBlocked ? 'Click để mở khóa' : dayEvent.label}
                        >
                          {dayEvent.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* MODAL 1: KHÓA LỊCH */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleBlockSubmit} className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Khóa lịch thiết bị</h3>
            <p className="text-sm text-gray-500 mb-4">Thiết bị: <span className="font-semibold">{selectedEq?.title}</span></p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Từ ngày</label>
                {/* min={todayISO} -> chặn click chọn ngày cũ */}
                <input 
                  required type="date" min={todayISO} 
                  className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" 
                  value={blockStart} onChange={(e) => setBlockStart(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Đến ngày</label>
                <input 
                  required type="date" min={blockStart || todayISO} 
                  className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" 
                  value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} 
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Lý do (Tùy chọn)</label>
              <input 
                type="text" placeholder="Vd: Bảo trì, Đem đi quay..." 
                className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" 
                value={blockReason} onChange={(e) => setBlockReason(e.target.value)} 
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowBlockModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg font-medium hover:bg-gray-200">Hủy</button>
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Khóa Lịch Ngay</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: MỞ KHÓA LỊCH */}
      {unblockTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 flex items-center justify-center rounded-full mx-auto mb-4">
              <span className="material-symbols-outlined text-[24px]">lock_open</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Mở khóa thiết bị?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Mở khóa lịch cho <b>{unblockTarget.label}</b>? Khách hàng sẽ có thể thuê lại vào những ngày này.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setUnblockTarget(null)} className="px-5 py-2 bg-gray-100 rounded-lg font-medium hover:bg-gray-200">Hủy</button>
              <button onClick={handleUnblockSubmit} className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Mở Khóa Ngay</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}