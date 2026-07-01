import React from 'react';

export const KPICard: React.FC<{ title: string, value: string | number, icon: string }> = ({ title, value, icon }) => (
  <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]">
    <div className="flex justify-between items-start mb-4">
      {/* Tiêu đề thẻ (Cập nhật font bold, uppercase rõ ràng) */}
      <p className="font-bold text-sm text-on-surface-variant uppercase tracking-wider">
        {title}
      </p>
      
      {/* Icon (Bo góc 2xl vuông vức hiện đại thay vì bo tròn mặc định, canh giữa hoàn hảo) */}
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
        <span className="material-symbols-outlined text-[26px]">
          {icon}
        </span>
      </div>
    </div>
    
    {/* Giá trị hiển thị (Chữ to, in đậm, chống tràn chữ nếu số tiền quá lớn) */}
    <h3 className="text-3xl font-extrabold text-on-surface tracking-tight break-words truncate">
      {value}
    </h3>
  </div>
);