import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../../styles/checkout.css';
import { ekycService } from '../../services/ekyc.service';
import { getAuthToken } from '../../utils/auth';
import { platformFeeFromSubtotal, rentalLineSubtotal } from '../../utils/pricing';

type SummaryItem = {
  id: string;
  lensId: string;
  name: string;
  imageUrl: string;
  ownerName: string;
  ownerRating?: number;
  startDate: string;
  endDate: string;
  rentalDays: number;
  quantity: number;
  pricePerDay: number;
  deposit: number;
};

function UploadBox({
  label,
  file,
  preview,
  onPick,
}: {
  label: string;
  file: File | null;
  preview: string | null;
  onPick: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Ảnh tối đa 5MB');
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)) {
      toast.error('Chỉ hỗ trợ JPG, PNG, WEBP');
      return;
    }
    onPick(f);
  };

  return (
    <div className="ekyc-upload-box-wrapper">
      <span className="ekyc-upload-label">{label}</span>
      <button
        type="button"
        className="ekyc-upload-box"
        onClick={() => inputRef.current?.click()}
        style={{
          border: preview ? '2px solid #0b45b3' : undefined,
          padding: 0,
          cursor: 'pointer',
          background: 'transparent',
          width: '100%',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt={label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
          />
        ) : (
          <>
            <div className="ekyc-upload-icon">
              <span className="material-symbols-outlined">add_a_photo</span>
            </div>
            <h4>Tải lên hoặc kéo thả</h4>
            <p>Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {file && <p style={{ fontSize: '12px', marginTop: '6px', color: '#64748b' }}>{file.name}</p>}
    </div>
  );
}

export default function VerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItems: SummaryItem[] = location.state?.selectedItems || [];

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const extractSubmitError = (err: unknown): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const data = (err as { response?: { data?: { message?: string | string[] } } }).response
        ?.data;
      const raw = data?.message;
      if (Array.isArray(raw)) return raw.join(', ');
      if (typeof raw === 'string' && raw.trim()) return raw;
    }
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'ECONNABORTED') {
      return 'Xác thực quá lâu. Kiểm tra kết nối mạng và thử lại.';
    }
    return 'Không xác thực được CCCD. Chụp lại ảnh mặt trước rõ nét, đủ ánh sáng.';
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

  const subtotal = selectedItems.reduce(
    (sum, i) => sum + rentalLineSubtotal(i.pricePerDay, i.rentalDays, i.quantity),
    0,
  );
  const platformFeeTotal = selectedItems.reduce(
    (sum, i) =>
      sum + platformFeeFromSubtotal(rentalLineSubtotal(i.pricePerDay, i.rentalDays, i.quantity)),
    0,
  );
  const rentalPlusPlatform = subtotal + platformFeeTotal;

  const goCheckout = useCallback(() => {
    navigate('/checkout', { state: { selectedItems } });
  }, [navigate, selectedItems]);

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login', { replace: true, state: { cartReturn: true } });
      return;
    }
    if (selectedItems.length === 0) {
      navigate('/cart', { replace: true });
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await ekycService.getStatus();
        if (!cancelled && res.data?.is_verified) {
          goCheckout();
        }
      } catch {
        /* user stays on verification */
      } finally {
        if (!cancelled) setCheckingStatus(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [goCheckout, navigate, selectedItems.length]);

  const pickFront = (file: File) => {
    setFrontFile(file);
    setFrontPreview(URL.createObjectURL(file));
  };

  const pickBack = (file: File) => {
    setBackFile(file);
    setBackPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!frontFile || !backFile) {
      toast.error('Vui lòng tải đủ mặt trước và mặt sau CCCD');
      return;
    }
    if (!confirmed) {
      toast.error('Vui lòng xác nhận ảnh CCCD là của bạn');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    const loadingId = toast.loading('Đang xác thực CCCD qua FPT.AI...');
    try {
      const res = await ekycService.submit(frontFile, backFile);
      toast.success(res.message || 'Xác thực eKYC thành công');
      setTimeout(() => goCheckout(), 800);
    } catch (err: unknown) {
      const msg = extractSubmitError(err);
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      toast.dismiss(loadingId);
      setSubmitting(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="checkout-page-wrapper" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <p>Đang kiểm tra trạng thái eKYC...</p>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-layout">
        <div className="checkout-main-column">
          <div className="checkout-stepper">
            <div className="stepper-item completed">
              <div className="stepper-circle">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  check
                </span>
              </div>
              <span>Giỏ hàng</span>
            </div>
            <div className="stepper-line completed" />
            <div className="stepper-item active">
              <div className="stepper-circle">2</div>
              <span>Xác thực CCCD</span>
            </div>
            <div className="stepper-line" />
            <div className="stepper-item">
              <div className="stepper-circle">3</div>
              <span>Thanh toán</span>
            </div>
          </div>

          <div className="checkout-card">
            <h2>Xác thực danh tính (eKYC)</h2>
            <p>
              Tải ảnh CCCD hai mặt. Hệ thống OCR qua FPT.AI trên server — API key không lộ ra trình
              duyệt.
            </p>

            {submitError && (
              <div
                className="ekyc-info-alert"
                style={{
                  marginBottom: '1rem',
                  borderColor: '#fecaca',
                  backgroundColor: '#fef2f2',
                }}
                role="alert"
              >
                <span className="material-symbols-outlined" style={{ color: '#dc2626' }}>
                  error
                </span>
                <div className="ekyc-info-text">
                  <h4 style={{ color: '#991b1b' }}>Không xác thực được CCCD</h4>
                  <p style={{ color: '#b91c1c' }}>{submitError}</p>
                </div>
              </div>
            )}

            <div className="ekyc-upload-grid">
              <UploadBox
                label="MẶT TRƯỚC CCCD"
                file={frontFile}
                preview={frontPreview}
                onPick={pickFront}
              />
              <UploadBox
                label="MẶT SAU CCCD"
                file={backFile}
                preview={backPreview}
                onPick={pickBack}
              />
            </div>

            <div className="ekyc-face-scan" style={{ marginTop: '1.5rem' }}>
              <div className="ekyc-face-info" style={{ flex: 1 }}>
                <div className="ekyc-status-badge">Bước xác nhận</div>
                <h3>Cam kết danh tính</h3>
                <p>
                  Ảnh CCCD phải là bản gốc, không chỉnh sửa. Dữ liệu được mã hóa khi truyền và chỉ
                  dùng để xác thực thuê thiết bị.
                </p>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '12px' }}>
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    style={{ marginTop: '4px' }}
                  />
                  <span>Tôi xác nhận ảnh CCCD là của tôi và đồng ý xác thực eKYC.</span>
                </label>
              </div>
            </div>

            <div className="ekyc-info-alert">
              <span className="material-symbols-outlined">info</span>
              <div className="ekyc-info-text">
                <h4>Tại sao cần eKYC?</h4>
                <p>
                  LensLease bảo vệ chủ máy và người thuê. Bạn không thể đặt thuê cho đến khi hoàn tất
                  bước này.
                </p>
              </div>
            </div>
          </div>

          <div className="checkout-navigation">
            <Link to="/cart" className="btn-back">
              <span className="material-symbols-outlined">arrow_back</span>
              Quay lại giỏ hàng
            </Link>
            <button
              type="button"
              className="btn-next active"
              disabled={submitting || !frontFile || !backFile || !confirmed}
              onClick={() => void handleSubmit()}
            >
              {submitting ? 'Đang xác thực...' : 'Xác thực & tiếp tục thanh toán'}
            </button>
          </div>
        </div>

        <div className="checkout-summary">
          <h3>Tóm tắt đơn hàng</h3>
          {selectedItems.map((item) => (
            <div key={item.id} className="summary-item">
              <img src={item.imageUrl} alt={item.name} className="summary-item-img" />
              <div className="summary-item-info">
                <h4 className="summary-item-name">{item.name}</h4>
                <p className="summary-item-owner">
                  Chủ sở hữu: <span>{item.ownerName}</span>
                </p>
                {item.ownerRating != null && (
                  <div className="summary-item-rating">
                    <span className="material-symbols-outlined">star</span>
                    <strong>{item.ownerRating}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="summary-details">
            <div className="summary-row">
              <span>Thời gian thuê</span>
              <div className="summary-row-right">
                <div className="summary-row-bold">
                  {selectedItems[0]?.rentalDays ?? 0} ngày
                </div>
                {selectedItems[0] && (
                  <div>
                    {selectedItems[0].startDate.split('-').reverse().join('/')} -{' '}
                    {selectedItems[0].endDate.split('-').reverse().join('/')}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="summary-costs">
            <div className="summary-cost-row">
              <span>Tiền thuê</span>
              <span className="summary-cost-value">{formatPrice(subtotal)}đ</span>
            </div>
            <div className="summary-cost-row">
              <span>Phí dịch vụ LensLease (8%)</span>
              <span className="summary-cost-value">{formatPrice(platformFeeTotal)}đ</span>
            </div>
          </div>

          <div className="summary-total">
            <span className="summary-total-label">Tiền thuê + phí sàn</span>
            <div className="summary-total-value">
              <span className="amount">{formatPrice(rentalPlusPlatform)}đ</span>
            </div>
          </div>

          <div className="trust-badge">
            <span className="material-symbols-outlined">verified_user</span>
            <p>
              <strong>Cam kết LensLease:</strong> eKYC bắt buộc trước khi đặt thuê thiết bị giá trị
              cao.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
