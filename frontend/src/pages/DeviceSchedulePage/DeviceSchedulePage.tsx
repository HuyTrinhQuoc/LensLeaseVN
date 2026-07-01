import React, { useState } from 'react';

// --- 1. ĐỊNH NGHĨA TYPES ---
type EventStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';

interface Equipment {
  id: string;
  name: string;
  image: string;
  totalBookings: number;
}

interface ScheduleEvent {
  date: number;
  status: EventStatus;
  label?: string;
  equipmentId: string;
}

// --- 2. MOCK DATA ---
const MOCK_EQUIPMENTS: Equipment[] = [
  { id: 'eq-1', name: 'Sony FE 24-70mm f/2.8 GM', image: '📷', totalBookings: 12 },
  { id: 'eq-2', name: 'Canon EOS R6 Mark II', image: '📸', totalBookings: 8 },
  { id: 'eq-3', name: 'DJI Ronin RS3 Pro', image: '🎥', totalBookings: 4 },
];

const MOCK_EVENTS: ScheduleEvent[] = [
  // Lịch của Sony 24-70mm
  { date: 5, status: 'BOOKED', label: 'Thuê: Tuấn', equipmentId: 'eq-1' },
  { date: 6, status: 'BOOKED', label: 'Thuê: Tuấn', equipmentId: 'eq-1' },
  { date: 14, status: 'BLOCKED', label: 'Vệ sinh', equipmentId: 'eq-1' },
  
  // Lịch của Canon R6
  { date: 10, status: 'BOOKED', label: 'Thuê: Mai', equipmentId: 'eq-2' },
  { date: 11, status: 'BOOKED', label: 'Thuê: Mai', equipmentId: 'eq-2' },
  { date: 12, status: 'BOOKED', label: 'Thuê: Mai', equipmentId: 'eq-2' },
  { date: 20, status: 'BLOCKED', label: 'Dùng cá nhân', equipmentId: 'eq-2' },

  // Lịch của DJI Ronin
  { date: 2, status: 'BOOKED', label: 'Thuê: Hùng', equipmentId: 'eq-3' },
];


export const Schedule: React.FC = () => {
  // State lưu thiết bị đang được chọn để xem lịch
  const [selectedEqId, setSelectedEqId] = useState<string>(MOCK_EQUIPMENTS[0].id);

  const selectedEquipment = MOCK_EQUIPMENTS.find(eq => eq.id === selectedEqId);

  // Lọc ra các sự kiện của thiết bị đang được chọn
  const currentEvents = MOCK_EVENTS.filter(ev => ev.equipmentId === selectedEqId);

  // Tạo mảng 31 ngày và gán status dựa trên currentEvents
  const daysInMonth = Array.from({ length: 31 }, (_, i) => {
    const date = i + 1;
    const eventForDay = currentEvents.find(ev => ev.date === date);
    
    return {
      date,
      status: eventForDay?.status || 'AVAILABLE',
      label: eventForDay?.label || '',
    };
  });

  const getStatusStyles = (status: EventStatus) => {
    if (status === 'BOOKED') return 'bg-blue-50 border-blue-200 text-blue-700';
    if (status === 'BLOCKED') return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100';
    return 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* === CỘT TRÁI: DANH SÁCH THIẾT BỊ === */}
        <div className="w-full lg:w-1/3 bg-white p-5 rounded-2xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Kho thiết bị của bạn</h2>
          <div className="flex flex-col gap-3">
            {MOCK_EQUIPMENTS.map((eq) => (
              <button
                key={eq.id}
                onClick={() => setSelectedEqId(eq.id)}
                className={`flex items-center gap-4 p-3 rounded-xl border text-left transition-all ${
                  selectedEqId === eq.id 
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                    : 'border-gray-100 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl">{eq.image}</div>
                <div>
                  <h3 className={`font-semibold ${selectedEqId === eq.id ? 'text-blue-700' : 'text-gray-700'}`}>
                    {eq.name}
                  </h3>
                  <p className="text-sm text-gray-500">{eq.totalBookings} lượt thuê tháng này</p>
                </div>
              </button>
            ))}
          </div>
          
          <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-gray-400 hover:text-gray-700 transition">
            + Thêm thiết bị mới
          </button>
        </div>

        {/* === CỘT PHẢI: LỊCH CỦA THIẾT BỊ ĐƯỢC CHỌN === */}
        <div className="w-full lg:w-2/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedEquipment?.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Lịch trình Tháng 6, 2026</p>
            </div>
            
            <div className="flex gap-4 text-sm font-medium">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-200"></span> Trống</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Đang thuê</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Đã khóa</div>
            </div>
          </div>

          {/* Lưới lịch (Calendar Grid) */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-semibold text-gray-600">
            <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            <div className="col-span-2"></div> {/* Giả lập Offset đầu tháng */}

            {daysInMonth.map((day) => (
              <div
                key={day.date}
                className={`min-h-[90px] p-2 rounded-xl border transition-colors flex flex-col ${getStatusStyles(day.status)}`}
              >
                <span className="text-right font-medium text-sm mb-1">{day.date}</span>
                {day.label && (
                  <div className={`text-xs px-2 py-1 rounded-md mt-auto truncate ${
                    day.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {day.label}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Nút hành động cho thiết bị hiện tại */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button className="px-5 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
              Khóa ngày
            </button>
            <button className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
              Tạo Booking thủ công
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};