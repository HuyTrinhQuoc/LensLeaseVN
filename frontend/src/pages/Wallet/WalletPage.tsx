import React from 'react';
import '../../styles/wallet.css';

export default function WalletPage() {
  return (
    <div className="wallet-page-wrapper">
      <div className="wallet-layout">
        
        {/* ── LEFT COLUMN (BALANCE) ── */}
        <div className="wallet-left-column">
          
          {/* Primary Balance Card */}
          <div className="wallet-main-card">
            <div className="wallet-card-header">
              <span className="material-symbols-outlined">verified_user</span>
              Ví ký quỹ an toàn
            </div>
            <h2 className="wallet-card-title">Ví ký quỹ</h2>
            
            <p className="wallet-balance-label">SỐ DƯ KHẢ DỤNG</p>
            <div className="wallet-balance-amount">
              12.500.000 <span>đ</span>
            </div>
            
            <div className="wallet-card-actions">
              <button className="wallet-btn wallet-btn--primary">Nạp tiền</button>
              <button className="wallet-btn wallet-btn--outline">Rút tiền</button>
            </div>
          </div>

          {/* Frozen Balance */}
          <div className="wallet-frozen-card">
            <div className="frozen-icon">
              <span className="material-symbols-outlined">ac_unit</span>
            </div>
            <p className="wallet-frozen-label">Số dư đóng băng</p>
            <div className="wallet-frozen-amount">
              4.200.000 <span>đ</span>
            </div>
            <p className="wallet-frozen-note">
              Tiền cọc cho <strong>2</strong> đơn thuê đang thực hiện. Sẽ được hoàn sau khi trả máy.
            </p>
          </div>

          {/* SmartContract Info */}
          <div className="wallet-security-card">
            <div className="security-icon">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <div className="security-info">
              <h4>Bảo mật đa lớp bởi SmartContract</h4>
              <p>Tiền của bạn được giữ an toàn bởi hệ thống ký quỹ tự động. Chỉ giải ngân khi cả hai bên xác nhận bàn giao.</p>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN (HISTORY & PROCESS) ── */}
        <div className="wallet-right-column">
          
          {/* History List */}
          <div>
            <div className="wallet-section-header">
              <h3>Lịch sử hoàn cọc</h3>
              <a href="#all">Xem tất cả</a>
            </div>
            
            <div className="wallet-history-list">
              {/* Item 1 */}
              <div className="history-item">
                <div className="history-item-left">
                  <div className="history-item-icon">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                  <div className="history-item-info">
                    <h4>Sony A7IV + Lens 24-70mm GM</h4>
                    <p>Mã ĐH: #CAM-8812 • 12/10/2023</p>
                  </div>
                </div>
                <div className="history-item-right">
                  <div className="history-item-amount">
                    + 2.500.000 <span>đ</span>
                  </div>
                  <div className="history-status refunded">ĐÃ HOÀN</div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="history-item">
                <div className="history-item-left">
                  <div className="history-item-icon">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                  <div className="history-item-info">
                    <h4>DJI Ronin RS3 Pro</h4>
                    <p>Mã ĐH: #CAM-7721 • 08/10/2023</p>
                  </div>
                </div>
                <div className="history-item-right">
                  <div className="history-item-amount">
                    + 1.200.000 <span>đ</span>
                  </div>
                  <div className="history-status refunded">ĐÃ HOÀN</div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="history-item">
                <div className="history-item-left">
                  <div className="history-item-icon processing">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </div>
                  <div className="history-item-info">
                    <h4>Blackmagic 6K Pro</h4>
                    <p>Mã ĐH: #CAM-9005 • Đang xử lý</p>
                  </div>
                </div>
                <div className="history-item-right">
                  <div className="history-item-amount processing">
                    4.200.000 <span>đ</span>
                  </div>
                  <div className="history-status checking">ĐANG KIỂM TRA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Process Timeline */}
          <div className="wallet-process-card">
            <h4 className="process-title">QUY TRÌNH KÝ QUỸ</h4>
            
            <div className="process-timeline">
              <div className="process-step">
                <div className="process-step-number">01</div>
                <div className="process-step-info">
                  <h4>Đặt cọc an toàn</h4>
                  <p>Tiền cọc được khóa trong ví SmartContract ngay khi bạn đặt thuê.</p>
                </div>
              </div>
              
              <div className="process-step">
                <div className="process-step-number">02</div>
                <div className="process-step-info">
                  <h4>Trải nghiệm thiết bị</h4>
                  <p>Bạn nhận máy và bắt đầu sáng tạo. Tiền cọc vẫn được bảo vệ tuyệt đối.</p>
                </div>
              </div>
              
              <div className="process-step">
                <div className="process-step-number">03</div>
                <div className="process-step-info">
                  <h4>Hoàn tiền tức thì</h4>
                  <p>Hệ thống tự động hoàn cọc ngay sau khi chủ máy xác nhận nhận lại thiết bị.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
