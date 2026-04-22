import React, { useState } from 'react';

export default function HandoverForm() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="max-w-4xl mx-auto my-8 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
      
      {/* Header Biên Bản */}
      <div className="bg-primary/5 border-b border-primary/10 p-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-primary mb-1">Biên Bản Bàn Giao Thiết Bị</h2>
          <p className="text-on-surface-variant text-sm font-medium">Mã đơn: <span className="font-bold text-on-surface">LL-94021-VN</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-on-surface">15 tháng 05, 2024</p>
          <p className="text-xs text-on-surface-variant">09:30 AM</p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        
        {/* Phần 1: Thông tin 2 bên */}
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-outline uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base">storefront</span> Bên A (Bên Cho Thuê)
            </h3>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2 text-sm">
              <p><span className="text-on-surface-variant w-24 inline-block">Họ Tên:</span> <span className="font-bold">Nguyễn Văn Camera</span></p>
              <p><span className="text-on-surface-variant w-24 inline-block">Số ĐT:</span> <span className="font-medium">0909 123 456</span></p>
              <p><span className="text-on-surface-variant w-24 inline-block">Địa chỉ:</span> <span className="font-medium">Quận 1, TP. HCM</span></p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-outline uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base">person</span> Bên B (Bên Thuê)
            </h3>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2 text-sm">
              <p><span className="text-on-surface-variant w-24 inline-block">Họ Tên:</span> <span className="font-bold">Trần Kỹ Thuật</span></p>
              <p><span className="text-on-surface-variant w-24 inline-block">CCCD:</span> <span className="font-bold text-primary">079123456789</span></p>
              <p><span className="text-on-surface-variant w-24 inline-block">Số ĐT:</span> <span className="font-medium">0988 765 432</span></p>
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/20" />

        {/* Phần 2: Chi tiết thiết bị & Check-list */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-outline uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">photo_camera</span> Tình Trạng Thiết Bị
          </h3>
          
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-7 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-outline-variant/30 hover:bg-surface-container transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary rounded cursor-pointer" />
                  <span className="font-medium">Sony Alpha A7 IV (Body)</span>
                </div>
                <span className="text-xs font-mono bg-surface-container-high px-2 py-1 rounded text-on-surface-variant">S/N: 3948201</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-outline-variant/30 hover:bg-surface-container transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary rounded cursor-pointer" />
                  <span className="font-medium">Ống kính FE 24-70mm f/2.8 GM</span>
                </div>
                <span className="text-xs font-mono bg-surface-container-high px-2 py-1 rounded text-on-surface-variant">S/N: 110294</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-outline-variant/30 hover:bg-surface-container transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary rounded cursor-pointer" />
                  <span className="font-medium">02 Pin NP-FZ100 + Sạc rời</span>
                </div>
              </div>
            </div>

            {/* Ghi chú & Tải ảnh */}
            <div className="col-span-5 space-y-4">
              <textarea 
                placeholder="Ghi chú thêm về ngoại hình (VD: Xước dăm đáy máy, có bụi ở kính trước lens...)" 
                className="w-full h-24 p-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
              ></textarea>
              <button className="w-full py-2.5 border-2 border-dashed border-outline-variant/50 rounded-lg text-primary font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">add_a_photo</span>
                Chụp ảnh tình trạng máy
              </button>
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/20" />

        {/* Phần 3: Tài sản thế chấp */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-outline uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">lock</span> Tiền cọc & Thế chấp
          </h3>
          <div className="flex gap-4">
            <div className="flex-1 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <p className="text-xs text-on-surface-variant mb-1">Tiền cọc giữ chân</p>
              <p className="text-lg font-bold text-primary">5,000,000 VNĐ</p>
            </div>
            <div className="flex-1 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <p className="text-xs text-on-surface-variant mb-1">Giấy tờ giữ lại</p>
              <p className="text-lg font-bold text-on-surface">CCCD Bản Gốc</p>
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/20" />

        {/* Phần 4: Chữ ký */}
        <div className="space-y-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-primary rounded cursor-pointer" 
            />
            <span className="text-sm text-on-surface-variant">
              Tôi xác nhận đã kiểm tra kỹ tình trạng thiết bị đúng như mô tả ở trên. Tôi đồng ý chịu trách nhiệm bồi thường nếu làm mất mát, hư hỏng theo chính sách của nền tảng.
            </span>
          </label>

          <div className="grid grid-cols-2 gap-8">
            <div className="border-2 border-dashed border-outline-variant/30 rounded-xl h-40 flex flex-col items-center justify-center bg-surface-container-lowest/50 group hover:border-primary/50 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-outline group-hover:text-primary mb-2">draw</span>
              <p className="text-sm font-bold text-on-surface">Chữ ký Bên A</p>
              <p className="text-xs text-outline">Chạm để ký điện tử</p>
            </div>
            <div className="border-2 border-dashed border-outline-variant/30 rounded-xl h-40 flex flex-col items-center justify-center bg-surface-container-lowest/50 group hover:border-primary/50 transition-colors cursor-pointer relative">
              {/* Giả lập trạng thái đã ký */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="font-[Shantell_Sans] text-4xl text-primary transform -rotate-12 opacity-80">Trần Kỹ Thuật</span>
              </div>
              <p className="text-sm font-bold text-on-surface absolute bottom-4">Bên B Đã Ký</p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer / Actions */}
      <div className="bg-surface-container p-6 flex justify-end gap-4">
        <button className="px-6 py-2.5 font-bold rounded-lg border-2 border-outline-variant/30 text-on-surface hover:bg-surface-container-lowest transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">print</span> In bản giấy
        </button>
        <button 
          disabled={!agreed}
          className={`px-8 py-2.5 font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg ${
            agreed 
            ? 'bg-primary text-on-primary hover:opacity-90 shadow-primary/20' 
            : 'bg-surface-dim text-outline cursor-not-allowed shadow-none'
          }`}
        >
          <span className="material-symbols-outlined text-sm">check_circle</span> Hoàn tất bàn giao
        </button>
      </div>

    </div>
  );
}