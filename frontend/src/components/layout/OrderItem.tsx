import React from 'react';


interface OrderItemProps {
  title: string;
  code: string;
  dateRange: string;
  duration: string;
  status: 'Đang thuê' | 'Sắp nhận' | 'Quá hạn' | 'Đã hoàn thành';
  imageUrl: string;
}

export default function OrderItem({ title, code, dateRange, duration, status, imageUrl }: OrderItemProps) {
  // Logic xử lý màu sắc dựa trên status (Sử dụng các màu v4 bạn đã định nghĩa)
  const getStatusStyles = () => {
    switch (status) {
      case 'Đang thuê': return 'bg-primary-fixed text-on-primary-fixed-variant';
      case 'Sắp nhận': return 'bg-tertiary-container text-on-tertiary-container';
      case 'Quá hạn': return 'bg-error-container text-on-error-container';
      default: return 'bg-surface-container-highest text-on-surface-variant';
    }
  };

  return (
    <div className={`bg-surface-container-lowest rounded-xl p-6 transition-all duration-300 hover:bg-white group ${status === 'Quá hạn' ? 'border-l-4 border-error/50' : ''}`}>
      <div className="flex items-center gap-8">
        {/* Ảnh sản phẩm */}
        <div className="w-32 h-32 rounded-xl bg-surface-container-low overflow-hidden flex-shrink-0">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        
        {/* Nội dung */}
        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-4">
            <h3 className={`text-xl font-bold mb-1 ${status === 'Quá hạn' ? 'text-error' : 'text-on-surface'}`}>{title}</h3>
            <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
              <span className="material-symbols-outlined text-sm">confirmation_number</span>
              <span>{code}</span>
            </div>
          </div>
          
          <div className="col-span-3">
            <p className="text-xs font-bold uppercase tracking-widest text-outline mb-1">Thời gian</p>
            <p className={`text-sm font-semibold ${status === 'Quá hạn' ? 'text-error' : 'text-on-surface'}`}>{dateRange}</p>
            <p className="text-xs text-on-surface-variant">{duration}</p>
          </div>

          <div className="col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest text-outline mb-1">Trạng thái</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusStyles()}`}>
              {status}
            </span>
          </div>

          <div className="col-span-3 flex justify-end">
             <button className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-lg transition-colors ${status === 'Quá hạn' ? 'bg-error text-white' : 'border-2 border-outline-variant/30 text-on-primary-fixed-variant hover:bg-surface-container'}`}>
               <span className="material-symbols-outlined text-sm">{status === 'Quá hạn' ? 'warning' : 'description'}</span>
               {status === 'Quá hạn' ? 'Liên hệ ngay' : 'Biên bản'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}