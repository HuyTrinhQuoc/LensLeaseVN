import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/checkout.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [hasScanned, setHasScanned] = useState(false);

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-layout">
        
        {/* ── LEFT COLUMN (MAIN FLOW) ── */}
        <div className="checkout-main-column">
          
          {/* Stepper */}
          <div className="checkout-stepper">
            <div className="stepper-item completed">
              <div className="stepper-circle">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
              </div>
              <span>Xác nhận lịch</span>
            </div>
            <div className="stepper-line completed"></div>
            
            <div className="stepper-item active">
              <div className="stepper-circle">2</div>
              <span>Xác thực CCCD/Khuôn mặt</span>
            </div>
            <div className="stepper-line"></div>
            
            <div className="stepper-item">
              <div className="stepper-circle">3</div>
              <span>Thanh toán</span>
            </div>
          </div>

          {/* eKYC Card */}
          <div className="checkout-card">
            <h2>Xác thực danh tính (eKYC)</h2>
            <p>Vui lòng cung cấp hình ảnh CCCD và thực hiện quét khuôn mặt để đảm bảo an toàn cho giao dịch thuê thiết bị.</p>
            
            {/* Upload Grid */}
            <div className="ekyc-upload-grid">
              {/* Front CCCD */}
              <div className="ekyc-upload-box-wrapper">
                <span className="ekyc-upload-label">MẶT TRƯỚC CCCD</span>
                <div className="ekyc-upload-box">
                  <div className="ekyc-upload-icon">
                    <span className="material-symbols-outlined">add_a_photo</span>
                  </div>
                  <h4>Tải lên hoặc kéo thả</h4>
                  <p>Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                </div>
              </div>
              
              {/* Back CCCD */}
              <div className="ekyc-upload-box-wrapper">
                <span className="ekyc-upload-label">MẶT SAU CCCD</span>
                <div className="ekyc-upload-box">
                  <div className="ekyc-upload-icon">
                    <span className="material-symbols-outlined">add_a_photo</span>
                  </div>
                  <h4>Tải lên hoặc kéo thả</h4>
                  <p>Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                </div>
              </div>
            </div>

            {/* Face Scan */}
            <div className="ekyc-face-scan">
              <div className="ekyc-face-preview">
                <img 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300&h=300" 
                  alt="Face preview placeholder" 
                />
                <div className="ekyc-face-frame"></div>
              </div>
              <div className="ekyc-face-info">
                <div className="ekyc-status-badge">Đang chờ quét</div>
                <h3>Xác thực khuôn mặt sống</h3>
                <p>Hệ thống cần xác nhận bạn là chủ sở hữu của CCCD. Hãy đảm bảo khuôn mặt nằm trong khung hình và đủ ánh sáng.</p>
                <button 
                  className="btn-scan" 
                  onClick={() => setHasScanned(true)}
                >
                  <span className="material-symbols-outlined">face_retouching_natural</span>
                  Bắt đầu quét khuôn mặt
                </button>
              </div>
            </div>

            {/* Info Alert */}
            <div className="ekyc-info-alert">
              <span className="material-symbols-outlined">info</span>
              <div className="ekyc-info-text">
                <h4>Tại sao tôi cần làm bước này?</h4>
                <p>LensLease VN cam kết bảo vệ cả người thuê và người cho thuê. Dữ liệu của bạn được mã hóa và chỉ sử dụng cho mục đích xác thực danh tính theo quy định pháp luật.</p>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="checkout-navigation">
            <button className="btn-back" onClick={() => navigate('/cart')}>
              <span className="material-symbols-outlined">arrow_back</span>
              Quay lại xác nhận lịch
            </button>
            <button className={`btn-next ${hasScanned ? 'active' : ''}`} disabled={!hasScanned}>
              Tiếp tục thanh toán
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN (SUMMARY) ── */}
        <div className="checkout-summary">
          <h3>Tóm tắt đơn hàng</h3>
          
          <div className="summary-item">
            <img 
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200&h=200" 
              alt="Sony Alpha A7 IV" 
              className="summary-item-img"
            />
            <div className="summary-item-info">
              <h4 className="summary-item-name">Sony Alpha A7 IV + FE 24-70mm f/2.8 GM II</h4>
              <p className="summary-item-owner">
                Chủ sở hữu: <span>Hoàng Nam Photo</span>
              </p>
              <div className="summary-item-rating">
                <span className="material-symbols-outlined">star</span>
                <strong>4.9</strong> (128 đánh giá)
              </div>
            </div>
          </div>

          <div className="summary-details">
            <div className="summary-row">
              <span>Thời gian thuê</span>
              <div className="summary-row-right">
                <div className="summary-row-bold">3 ngày</div>
                <div>15/10 - 18/10/2024</div>
              </div>
            </div>
            <div className="summary-row">
              <span>Địa điểm nhận</span>
              <div className="summary-row-bold">Quận 1, TP. HCM</div>
            </div>
          </div>

          <div className="summary-costs">
            <div className="summary-cost-row">
              <span>Giá thuê (850.000đ x 3)</span>
              <span className="summary-cost-value">2.550.000đ</span>
            </div>
            <div className="summary-cost-row">
              <span>Phí bảo hiểm thiết bị</span>
              <span className="summary-cost-value">150.000đ</span>
            </div>
            <div className="summary-cost-row">
              <span>Phí dịch vụ LensLease</span>
              <span className="summary-cost-value">75.000đ</span>
            </div>
          </div>

          <div className="summary-total">
            <span className="summary-total-label">Tổng cộng</span>
            <div className="summary-total-value">
              <span className="amount">2.775.000đ</span>
              <span className="note">*Đã bao gồm thuế GTGT</span>
            </div>
          </div>

          <div className="trust-badge">
            <span className="material-symbols-outlined">verified_user</span>
            <p>
              <strong>Cam kết LensLease:</strong> Hoàn tiền 100% nếu thiết bị không đúng mô tả hoặc gặp lỗi kỹ thuật trong quá trình thuê.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
