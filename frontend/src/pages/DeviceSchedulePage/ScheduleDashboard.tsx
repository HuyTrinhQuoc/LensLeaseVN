import React from 'react';
import { useDeviceSchedule } from '../../hooks/useScheduleData';

export default function DeviceSchedulePage() {
  const { equipments, selectedEqId, setSelectedEqId, events, loading } = useDeviceSchedule();
  const selectedEq = equipments.find((eq) => eq.id === selectedEqId);

  return (
    <main className="pdb-main">


      {/* ── CONTENT AREA ── */}
      <div className="pdb-content">
        {loading ? (
          <div className="pdb-orders__loading">
            <span className="material-symbols-outlined animate-spin text-4xl mb-2">autorenew</span>
            <p>Đang tải dữ liệu lịch trình...</p>
          </div>
        ) : equipments.length === 0 ? (
          <div className="pdb-orders__empty">
            <span className="material-symbols-outlined pdb-orders__empty-icon">inventory_2</span>
            <h3>Bạn chưa có thiết bị nào</h3>
            <p>Hãy thêm thiết bị để bắt đầu quản lý lịch cho thuê nhé.</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Cột trái: DANH SÁCH THIẾT BỊ */}
            <div className="w-full lg:w-1/3 bg-white p-5 rounded-[14px] shadow-sm border border-[#e8ecf2] h-fit">
              <h2 className="text-[16px] font-bold text-[#1e293b] mb-4">Kho thiết bị ({equipments.length})</h2>
              <div className="flex flex-col gap-3">
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
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {eq.thumbnail ? (
                        <img src={eq.thumbnail} alt={eq.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="material-symbols-outlined">camera</span>
                        </div>
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
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1e293b]">{selectedEq?.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">Lịch trình tháng này</p>
                </div>
                <div className="flex gap-4 text-[12.5px] font-medium">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span> Có khách thuê</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> Đã khóa</div>
                </div>
              </div>

              {/* Tên ngày trong tuần */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[13px] font-bold text-[#64748b]">
                <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
              </div>

              {/* Lưới 31 ngày (Mô phỏng tĩnh để bạn test) */}
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-2"></div> {/* Lùi đầu tháng */}
                
                {Array.from({ length: 31 }).map((_, i) => {
                  const dateNum = i + 1;
                  
                  // Logic so sánh xem ngày hiện tại có nằm trong event nào không
                  const dayEvent = events.find((ev) => {
                    const start = new Date(ev.start_date).getDate();
                    const end = new Date(ev.end_date).getDate();
                    return dateNum >= start && dateNum <= end;
                  });

                  const isBooked = dayEvent?.type === 'BOOKING';
                  const isBlocked = dayEvent?.type === 'BLOCKED';

                  return (
                    <div
                      key={dateNum}
                      className={`min-h-[85px] p-2 rounded-[10px] border flex flex-col transition-all ${
                        isBooked ? 'bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8]' :
                        isBlocked ? 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]' :
                        'bg-white border-[#e8ecf2] text-[#64748b] hover:bg-[#f5f7fb]'
                      }`}
                    >
                      <span className="text-right font-bold text-[13px] mb-1">{dateNum}</span>
                      {dayEvent && (
                        <div 
                          className={`text-[10px] px-1.5 py-1 rounded-[6px] mt-auto truncate font-semibold ${
                            isBooked ? 'bg-[#dbeafe] text-[#1e40af]' : 'bg-[#fee2e2] text-[#991b1b]'
                          }`}
                          title={dayEvent.label}
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
    </main>
  );
}