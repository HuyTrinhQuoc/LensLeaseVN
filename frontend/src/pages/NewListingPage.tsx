import "../styles/new-listing.css";

interface NavItem {
  icon: string;
  label: string;
}

interface ConditionItem {
  label: string;
  checked?: boolean;
}

interface PreviewImage {
  src?: string;
  alt: string;
  isAddMore?: boolean;
}

const navItems: NavItem[] = [
  { icon: "dashboard", label: "Tổng quan" },
  { icon: "camera", label: "Thiết bị của tôi" },
  { icon: "pending_actions", label: "Yêu cầu thuê" },
  { icon: "calendar_today", label: "Lịch trình" },
  { icon: "payments", label: "Doanh thu" },
  { icon: "settings", label: "Cài đặt" },
];

const conditionItems: ConditionItem[] = [
  { label: "Cảm biến sạch", checked: true },
  { label: "Thân máy không trầy xước", checked: true },
  { label: "Ống kính không mốc/rễ tre", checked: true },
  { label: "Màn hình không điểm chết", checked: false },
];

const previewImages: PreviewImage[] = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzK9igNrPdPcG2H8uY96-IIsrL9AnauSNvHXUC_lTX5CTBs0XN-I9m4MBgQgmSTQqn1psZHQju_rnMDlnWH_FB6qnPvkYOSjaw9JIrB6XDq3V8oNlgu3hmVlepFBq5kKY4pcZOy1izPDhmBxg16IGh_0P8pBuK2uNPrwMUq4LLczrxodfKo_X_VQI6cdzke3lGRspgBl0_vk2xUKrou1DcPf0WHtphiwGu54h0-1PIoc2-TbsmFwHqTBvnDedZEAldaRddlGOdsus",
    alt: "Camera Product",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUZDT87Wm6qHBct9JJqX5nx6ycLssch8xQOfSYMqPVZQqLoRNsx2zsoyjQV3nLQld7qAb5OH5A41rSddscxrZzKNzY7zkJ5-0LY4No6BrP37XHKDGP6yUywdti9a7xNy38MjXqToi6hvTkpIiQuCOGHi5VmHKmCV8LeR18AFLoiOaWAhC4aTeoc2muvIcxEAVuV0I6hroUZBkuI_9Ev03hVhOrWZXtbhZeKhhhjt7eS3mA2iRlfr7digJosHpsvLMiD7ECiC-YPN4",
    alt: "Camera Lens",
  },
  {
    alt: "Add more",
    isAddMore: true,
  },
];

const photoTips = [
  "Chụp trong điều kiện đủ sáng tự nhiên.",
  "Thể hiện rõ các cổng kết nối và sensor.",
  "Đặt máy trên nền đơn sắc để nổi bật sản phẩm.",
];

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

function NewListingPage() {
  return (
    <div className="dashboard-page new-listing-page">
      <aside className="listing-sidebar">
        <div className="listing-sidebar__brand">
          <h1>Aperture Exchange</h1>
          <p>Người cho thuê chuyên nghiệp</p>
        </div>

        <nav className="listing-sidebar__nav">
          {navItems.map((item) => (
            <a key={item.label} href="#" className="listing-sidebar__nav-item">
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="listing-sidebar__bottom">
          <div className="listing-sidebar__promo">
            <p>Sẵn sàng để mở rộng kho thiết bị?</p>
            <button className="dashboard-btn-primary listing-sidebar__promo-btn">
              Thêm thiết bị mới
            </button>
          </div>

          <div className="listing-sidebar__profile">
            <div className="listing-sidebar__avatar">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2NnwP8sV0njFrYpcqJKV7Z-dGL2za29U3jOw209F5C1UzCm0WaPKO1SuUZAjC_eOz3ppfEkLrJwMikh9eJFVxWg-vxQmdFH9kIphVXScOMwt9-wVL0yjObRePvR9_Z8gxH3DWjHxpedU_o1fiUWsb3c3Qbz_PCwzRRCMOpZA2ZQQ_BJ97XOrg6l_RgDGIyTfsx5_WOGTMLFT_R7vuxcreRXmPQaLSKrxonlGEM6VOyi2F4IDzyHO_UkF7dvCO9W2hKEMI7wEzN1U"
                alt="Lender Profile"
              />
            </div>

            <div className="listing-sidebar__profile-info">
              <p className="listing-sidebar__profile-name">Minh Quân</p>
              <p className="listing-sidebar__profile-role">Pro Vendor</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="listing-main">
        <header className="listing-topbar">
          <div className="listing-topbar__search">
            <Icon name="search" />
            <input type="text" placeholder="Tìm kiếm trong kho của bạn..." />
          </div>

          <div className="listing-topbar__actions">
            <button className="listing-topbar__icon-btn" aria-label="Thông báo">
              <Icon name="notifications" />
              <span className="listing-topbar__dot" />
            </button>

            <button className="listing-topbar__icon-btn" aria-label="Trợ giúp">
              <Icon name="help_outline" />
            </button>
          </div>
        </header>

        <div className="listing-content">
          <header className="listing-page-header">
            <nav className="listing-breadcrumb">
              <span>Thiết bị của tôi</span>
              <span>/</span>
              <span className="is-active">Đăng tin mới</span>
            </nav>

            <h2>Đăng thiết bị mới lên LensLease</h2>
            <p>
              Cung cấp chi tiết chính xác để tăng cơ hội tiếp cận khách hàng
              tiềm năng và đảm bảo an toàn cho thiết bị của bạn.
            </p>
          </header>

          <div className="listing-layout">
            <div className="listing-form-sections">
              <section className="dashboard-card listing-section">
                <div className="listing-section__title">
                  <h3>Thông tin cơ bản</h3>
                </div>

                <div className="listing-form-grid">
                  <div className="listing-form-field full">
                    <label>Tên máy</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Sony Alpha A7 IV"
                    />
                  </div>

                  <div className="listing-form-field">
                    <label>Hãng</label>
                    <select defaultValue="Sony">
                      <option>Sony</option>
                      <option>Canon</option>
                      <option>Nikon</option>
                      <option>Fujifilm</option>
                      <option>Panasonic</option>
                    </select>
                  </div>

                  <div className="listing-form-field">
                    <label>Năm sản xuất</label>
                    <input type="number" placeholder="2023" />
                  </div>

                  <div className="listing-form-field full">
                    <label>Mô tả</label>
                    <textarea
                      rows={4}
                      placeholder="Chia sẻ về tình trạng máy, số lượng pin đi kèm, hoặc các phụ kiện hỗ trợ..."
                    />
                  </div>
                </div>
              </section>

              <section className="dashboard-card listing-section">
                <div className="listing-section__title">
                  <h3>Chi tiết kỹ thuật &amp; Bảo mật</h3>
                </div>

                <div className="listing-stack">
                  <div className="listing-form-field">
                    <label>Số seri (S/N)</label>
                    <p className="listing-field-note">
                      Thông tin này sẽ được bảo mật và chỉ dùng để đối soát khi
                      có sự cố.
                    </p>
                    <input
                      type="text"
                      placeholder="S/N: 29384XXX"
                      className="listing-field-narrow"
                    />
                  </div>

                  <div>
                    <label className="listing-group-label">
                      Tình trạng linh kiện
                    </label>

                    <div className="listing-check-grid">
                      {conditionItems.map((item) => (
                        <label key={item.label} className="listing-check-item">
                          <input
                            type="checkbox"
                            defaultChecked={item.checked}
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="dashboard-card listing-section">
                <div className="listing-section__title">
                  <h3>Chính sách &amp; Giá</h3>
                </div>

                <div className="listing-form-grid listing-form-grid--policy">
                  <div className="listing-form-field">
                    <label>Giá thuê theo ngày</label>
                    <div className="listing-input-with-suffix">
                      <input type="text" placeholder="500.000" />
                      <span>VNĐ</span>
                    </div>
                  </div>

                  <div className="listing-form-field">
                    <label>Gói bảo hiểm đề xuất</label>
                    <select defaultValue="Cơ bản (Đề xuất)">
                      <option>Cơ bản (Đề xuất)</option>
                      <option>Toàn diện (+15%)</option>
                      <option>Không bảo hiểm (Rủi ro cao)</option>
                    </select>
                  </div>

                  <div className="listing-warning-box full">
                    <label className="listing-warning-box__label">
                      <Icon name="warning" />
                      Giá đền bù nếu hư hỏng/mất mát
                    </label>

                    <p>
                      Mức phí này sẽ là căn cứ pháp lý để giải quyết khi có sự
                      cố nghiêm trọng.
                    </p>

                    <div className="listing-input-with-suffix listing-input-with-suffix--danger">
                      <input type="text" placeholder="45.000.000" />
                      <span>VNĐ</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="listing-media-column">
              <div className="listing-media-sticky">
                <section className="dashboard-card listing-media-panel">
                  <h3>Hình ảnh thiết bị</h3>

                  <div className="listing-upload-zone">
                    <div className="listing-upload-zone__icon">
                      <Icon name="add_a_photo" />
                    </div>
                    <p>Kéo thả hoặc click để tải</p>
                    <span>Tối thiểu 5 ảnh chất lượng cao (PNG, JPG)</span>
                  </div>

                  <div className="listing-preview-grid">
                    {previewImages.map((item, index) =>
                      item.isAddMore ? (
                        <div key={index} className="listing-preview-add">
                          <Icon name="add" />
                        </div>
                      ) : (
                        <div key={index} className="listing-preview-item">
                          <img src={item.src} alt={item.alt} />
                          <button
                            className="listing-preview-remove"
                            aria-label="Xóa ảnh"
                          >
                            <Icon name="close" />
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  <div className="listing-photo-tips">
                    <h4>Mẹo chụp ảnh đẹp</h4>
                    <ul>
                      {photoTips.map((tip, index) => (
                        <li key={tip}>
                          <span>{String(index + 1).padStart(2, "0")}.</span>
                          <p>{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>
            </aside>
          </div>
        </div>

        <footer className="listing-footer">
          <div className="listing-footer__progress">
            <span>Tiến độ hoàn tất</span>
            <div className="listing-footer__progress-bar">
              <div className="listing-footer__progress-value" />
            </div>
          </div>

          <div className="listing-footer__actions">
            <button className="listing-cancel-btn">Hủy</button>
            <button className="dashboard-btn-primary listing-submit-btn">
              Đăng tin ngay
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default NewListingPage;