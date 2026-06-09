import { useState } from 'react';
import { handoverService } from '../../services/handover.service';
import toast, { Toaster } from 'react-hot-toast';

interface HandoverFormProps {
  bookingData: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function HandoverForm({ bookingData, onSuccess, onCancel }: HandoverFormProps) {
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [noteCheckin, setNoteCheckin] = useState('');
  const [imagesCheckin, setImagesCheckin] = useState<string[]>([]);

  const [noteCheckout, setNoteCheckout] = useState('');
  const [imagesCheckout, setImagesCheckout] = useState<string[]>([]);
  const [isDamaged, setIsDamaged] = useState(false);

  const bookingId = bookingData?.id;
  const status = bookingData?.status;
  const renter = bookingData?.user;
  const owner = bookingData?.owner;
  const bookingItems = bookingData?.items || [];

  const isCheckOutMode = status === 'ACTIVE';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    try {
      setUploading(true);
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (data.secure_url) {
          newUrls.push(data.secure_url);
        } else {
          console.error("Lỗi từ Cloudinary API:", data);
        }
      }

      if (isCheckOutMode) {
        setImagesCheckout(prev => [...prev, ...newUrls]);
      } else {
        setImagesCheckin(prev => [...prev, ...newUrls]);
      }

    } catch (error) {
      console.error('Lỗi kết nối upload Cloudinary:', error);
      alert('Không thể tải ảnh lên đám mây, vui lòng thử lại!');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (isCheckOutMode) {
      setImagesCheckout((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImagesCheckin((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!agreed) return;
    const loadingToast = toast.loading('Đang xử lý biên bản trên hệ thống...');
    try {
      setIsSubmitting(true);

      if (isCheckOutMode) {
        await handoverService.processCheckOut(bookingId, {
          note_checkout: noteCheckout,
          images_checkout: imagesCheckout,
          is_damaged: isDamaged
        });
        toast.dismiss(loadingToast);
        toast.success('Xác nhận trả thiết bị thành công! Đơn hàng đã hoàn tất.');
      } else {
        await handoverService.processCheckIn(bookingId, {
          note_checkin: noteCheckin,
          images_checkin: imagesCheckin,
          signature_a: "SIGNED_BY_OWNER_MOCK_DATA",
          signature_b: "SIGNED_BY_RENTER_MOCK_DATA"
        });
        toast.dismiss(loadingToast);
        toast.success('Lập biên bản thành công! Thiết bị đã được bàn giao cho người thuê.');
      }

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error(error);
      const errorMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi xử lý biên bản, vui lòng thử lại.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
    <div className="max-w-4xl mx-auto my-8 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
      
      <div className={`${isCheckOutMode ? 'bg-error/5 border-error/10' : 'bg-primary/5 border-primary/10'} border-b p-8 flex justify-between items-center`}>
        <div>
          <h2 className={`text-2xl font-extrabold tracking-tight mb-1 ${isCheckOutMode ? 'text-error' : 'text-primary'}`}>
            {isCheckOutMode ? 'Biên Bản Nhận Lại Thiết Bị (Check-out)' : 'Biên Bản Bàn Giao Thiết Bị (Check-in)'}
          </h2>
          <p className="text-on-surface-variant text-sm font-medium">Mã đơn: <span className="font-bold text-on-surface">#{String(bookingId).slice(0, 8).toUpperCase()}</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-on-surface">
            {isCheckOutMode 
              ? (bookingData?.end_date ? new Date(bookingData.end_date).toLocaleDateString('vi-VN') : '---')
              : (bookingData?.start_date ? new Date(bookingData.start_date).toLocaleDateString('vi-VN') : '---')
            }
          </p>
          <p className="text-xs text-on-surface-variant">{isCheckOutMode ? 'Ngày trả máy' : 'Ngày nhận máy'}</p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-outline uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base">storefront</span> Bên A (Bên Cho Thuê)
            </h3>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2 text-sm">
              <p><span className="text-on-surface-variant w-24 inline-block">Họ Tên:</span> <span className="font-bold">{owner?.full_name || 'Chưa cập nhật'}</span></p>
              <p><span className="text-on-surface-variant w-24 inline-block">Số ĐT:</span> <span className="font-medium">{owner?.phone || '---'}</span></p>
              <p><span className="text-on-surface-variant w-24 inline-block">Địa chỉ:</span> <span className="font-medium">{owner?.address || '---'}</span></p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-outline uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base">person</span> Bên B (Bên Thuê)
            </h3>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2 text-sm">
              <p><span className="text-on-surface-variant w-24 inline-block">Họ Tên:</span> <span className="font-bold">{renter?.full_name || 'Chưa cập nhật'}</span></p>
              <p><span className="text-on-surface-variant w-24 inline-block">Số ĐT:</span> <span className="font-medium">{renter?.phone || '---'}</span></p>
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/20" />

        <div className="space-y-4">
          <h3 className="font-bold text-sm text-outline uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">photo_camera</span> 
            {isCheckOutMode ? 'Kiểm Tra Tình Trạng Thu Hồi Máy' : 'Kiểm Tra Thiết Bị Bàn Giao'}
          </h3>
          
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-7 space-y-3">
              {bookingItems.map((item: any, idx: number) => (
                <div key={item.id || idx} className="flex items-center justify-between p-3 rounded-lg border border-outline-variant/30 hover:bg-surface-container transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary rounded cursor-pointer" />
                    <span className="font-medium">{item.lens?.title || 'Thiết bị công nghệ'}</span>
                  </div>
                  <span className="text-xs font-mono bg-surface-container-high px-2 py-1 rounded text-on-surface-variant">SL: {item.quantity}</span>
                </div>
              ))}
              {bookingItems.length === 0 && <p className="text-sm text-outline">Không có thiết bị nào trong đơn đặt</p>}

              {isCheckOutMode && (
                <div className={`p-4 rounded-xl border mt-4 flex items-center justify-between ${isDamaged ? 'bg-error/10 border-error/30' : 'bg-surface-container border-outline-variant/20'}`}>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Phát hiện lỗi / Hư hại / Trầy xước mới?</p>
                    <p className="text-xs text-on-surface-variant">Tích vào ô bên cạnh nếu thiết bị phát sinh lỗi cần xử lý bồi thường.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={isDamaged} 
                    onChange={(e) => setIsDamaged(e.target.checked)} 
                    className="w-6 h-6 accent-error rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="col-span-5 space-y-4">
              <textarea 
                value={isCheckOutMode ? noteCheckout : noteCheckin}
                onChange={(e) => isCheckOutMode ? setNoteCheckout(e.target.value) : setNoteCheckin(e.target.value)}
                placeholder={isCheckOutMode 
                  ? "Nhập tình trạng khi nhận lại (Ví dụ: Máy hoạt động tốt, đã hoàn trả đầy đủ phụ kiện...)" 
                  : "Ghi chú thêm về ngoại hình (VD: Xước dăm đáy máy, có bụi ở kính trước lens...)"
                } 
                className="w-full h-24 p-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
              ></textarea>
              
              <input 
                type="file" 
                id="handover-image-upload"
                accept="image/*"
                multiple
                className="hidden" 
                onChange={handleFileChange}
                disabled={uploading}
              />
              
              <label 
                htmlFor="handover-image-upload"
                className={`w-full py-2.5 border-2 border-dashed border-outline-variant/50 rounded-lg font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="material-symbols-outlined text-sm">
                  {uploading ? 'hourglass_empty' : 'add_a_photo'}
                </span>
                {uploading ? 'Đang tải ảnh...' : `Tải ảnh minh chứng (${isCheckOutMode ? imagesCheckout.length : imagesCheckin.length} ảnh)`}
              </label>

              <div className="grid grid-cols-4 gap-2 mt-2">
                {(isCheckOutMode ? imagesCheckout : imagesCheckin).map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container group">
                    <img src={url} alt={`Evidence ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-xs block">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/20" />

        <div className="space-y-4">
          <h3 className="font-bold text-sm text-outline uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">lock</span> Tiền cọc & Thế chấp
          </h3>
          <div className="flex gap-4">
            <div className="flex-1 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <p className="text-xs text-on-surface-variant mb-1">Tiền đặt cọc cấu hình đơn</p>
              <p className="text-lg font-bold text-primary">
                {bookingData?.deposit_amount ? Number(bookingData.deposit_amount).toLocaleString('vi-VN') : '0'} VNĐ
              </p>
            </div>
            <div className="flex-1 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <p className="text-xs text-on-surface-variant mb-1">Hình thức cọc đã chọn</p>
              <p className="text-lg font-bold text-on-surface">
                {bookingData?.selected_deposit_type === 'PAPERWORK' ? 'Giữ Giấy tờ (CCCD)' : 'Tiền mặt/Qua Sàn'}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/20" />

        <div className="space-y-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-primary rounded cursor-pointer" 
            />
            <span className="text-sm text-on-surface-variant">
              {isCheckOutMode 
                ? "Bên Cho Thuê xác nhận đã nhận lại đầy đủ thiết bị và phụ kiện từ Bên Thuê đúng cam kết, không có tranh chấp phát sinh thêm ngoài ghi chú."
                : "Tôi xác nhận đã kiểm tra kỹ tình trạng thiết bị đúng mô tả ở trên và đồng ý chịu trách nhiệm bồi thường nếu làm hư hỏng theo chính sách sàn."
              }
            </span>
          </label>

          <div className="grid grid-cols-2 gap-8">
            <div className="border-2 border-dashed border-outline-variant/30 rounded-xl h-40 flex flex-col items-center justify-center bg-surface-container-lowest/50 group hover:border-primary/50 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-outline group-hover:text-primary mb-2">draw</span>
              <p className="text-sm font-bold text-on-surface">Chữ ký Bên A</p>
              <p className="text-xs text-outline">Chạm để ký điện tử</p>
            </div>
            <div className="border-2 border-dashed border-outline-variant/30 rounded-xl h-40 flex flex-col items-center justify-center bg-surface-container-lowest/50 group hover:border-primary/50 transition-colors cursor-pointer relative">
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="font-[Shantell_Sans] text-4xl text-primary transform -rotate-12 opacity-80">
                   {renter?.full_name ? renter.full_name : 'Bên B'}
                 </span>
              </div>
              <p className="text-sm font-bold text-on-surface absolute bottom-4">Bên B Đã Ký</p>
            </div>
          </div>
        </div>

      </div>

      <div className="bg-surface-container p-6 flex justify-end gap-4">
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 font-bold rounded-lg border border-outline-variant/30 text-on-surface hover:bg-surface-dim transition-colors"
          >
            Hủy bỏ
          </button>
        )}
        <button 
          type="button"
          disabled={!agreed || isSubmitting || uploading}
          onClick={handleSubmit}
          className={`px-8 py-2.5 font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg ${
            agreed && !isSubmitting && !uploading
            ? (isCheckOutMode ? 'bg-error text-white hover:opacity-90 shadow-error/20' : 'bg-primary text-on-primary hover:opacity-90 shadow-primary/20') 
            : 'bg-surface-dim text-outline cursor-not-allowed shadow-none'
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {isSubmitting ? 'hourglass_empty' : 'check_circle'}
          </span> 
          {isSubmitting ? 'Đang xử lý...' : (isCheckOutMode ? 'Xác nhận trả máy (Check-out)' : 'Hoàn tất bàn giao')}
        </button>
      </div>

    </div>
    </>
  );
}