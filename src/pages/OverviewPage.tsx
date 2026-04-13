import "../styles/overview.css";

interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
}

interface StatItem {
  title: string;
  value: string;
  accent: "primary" | "tertiary" | "blue" | "secondary";
  extra?: string;
  extraType?: "success" | "neutral";
  showPulse?: boolean;
  valueClassName?: string;
}

interface RentalRequest {
  name: string;
  verifiedLabel: string;
  equipment: string;
  dateRange: string;
  price: string;
  avatar: string;
}

interface RentedItem {
  title: string;
  renter: string;
  returnDate: string;
  image: string;
}

interface ScheduleItem {
  time: string;
  title: string;
  location: string;
  active?: boolean;
  hasLine?: boolean;
}

const navItems: NavItem[] = [
  { icon: "dashboard", label: "Tổng quan", active: true },
  { icon: "camera", label: "Thiết bị của tôi" },
  { icon: "pending_actions", label: "Yêu cầu thuê" },
  { icon: "calendar_today", label: "Lịch trình" },
  { icon: "payments", label: "Doanh thu" },
  { icon: "settings", label: "Cài đặt" },
];

const statItems: StatItem[] = [
  {
    title: "Doanh thu tháng này",
    value: "15.000.000đ",
    accent: "primary",
    extra: "+12%",
    extraType: "success",
  },
  {
    title: "Yêu cầu chờ duyệt",
    value: "4 yêu cầu mới",
    accent: "tertiary",
    showPulse: true,
  },
  {
    title: "Tiền cọc đang treo (Escrow)",
    value: "8.500.000đ",
    accent: "blue",
  },
  {
    title: "Tỷ lệ phản hồi",
    value: "98%",
    accent: "secondary",
    valueClassName: "is-primary-text",
  },
];

const rentalRequests: RentalRequest[] = [
  {
    name: "Hoàng Minh Anh",
    verifiedLabel: "Đã xác thực",
    equipment: "Sony Alpha A7 IV + 24-70mm GM",
    dateRange: "25/05 - 28/05 (3 ngày)",
    price: "3.200.000đ",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDYuFSu_OMT74GMM3yzUIe6SzgTgssomzTL1tmOga4VQzoubQifc7SoRCOEXiJa3dAUGH6J7HD7oQdlTfTF-NosBft8-wOa4CnvrJEuiMBNkOsaF9DwCkXe1BRdS0-00JK_sDLQP7J4xKRmUfOPSOqws0nkX6z28dqWmtBLIiiS2uBH1a3Y7O7wifdT4UDjNV2yKybQ9-Eg7ZqxoIGd5b-z7EtqcYC-qgAzOw-xdlbC9e9eMhQ2VtEMex1EM_sMViZz5rCmmlWbgKU",
  },
  {
    name: "Lê Thị Thuỷ",
    verifiedLabel: "Thành viên mới",
    equipment: "DJI RS 3 Pro Gimbal",
    dateRange: "26/05 - 27/05 (1 ngày)",
    price: "850.000đ",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDE4p51qv9mlCs2ay1VKOPYP-nsPz3buna2FCeeEaE4jYdyqqe3yJlkuG3WdHgUoEy8Arofxyg0_pdq9aPmBagxfskaAKhixMq6_URGp8Iai-5qR0s1wX0-FLT90d_bbMsnP_vikIWhqlPRBT0KIp-YoGx03rS4oKISLiAcnTch6Dw07gme4iz7bAmT2zYCqFnrF1s-ECjD66Fai-6xgkRRUef-QEnNux7MR1ENUUAz8XwlZtJPZ8M68QYhuMQ-bqXwuVLKdD6Expo",
  },
];

const rentedItems: RentedItem[] = [
  {
    title: "Canon EOS R5 + RF 50mm f/1.2",
    renter: "Trần Trung Hiếu",
    returnDate: "28 Tháng 5, 2024",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDV4V0V6UxwNCsFFTRNe7chR3X22sNPZXg5pE8ViC1Z6JVgcHtDY1Fx6mMFSQH5FhQ-Tx3NkyLKJm85EXcFpHHWbHhuh3_Xh8C5dQgr6SdMxWxwgUoAsjKQnanq2lVVE1RQJXnVj5XpXG6fS8exWAgjeeUjEPrg1ijSlZADUNxbXJsrQc9RS_WdLkWoLbaNn6hL6X8FM98yBWmfbz2oW4wOk2rwIK99YfP_XO692PPg-VGb6BL4vJn3qnU2IPeuqQRd8sGP9crJ3Sk",
  },
  {
    title: "Arri Alexa Mini LF Kit",
    renter: "Creative Studio X",
    returnDate: "02 Tháng 6, 2024",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCR5LtsUHiOWqGr_xIqqyMf-gW1Sn3SN0eSNCWezt6kve0SMPHP3ervqk3CGqadyoLWnovU_fiS_4xCdbGT4cHArUbqVM-ECcNSc8N81dwzstlho9GHhttEEM8t2gujYjqNcbyqmMilxE07kzyqP3PbWrNqSGdMg43odZouqZU4iNUSTX0PHRFN3x4pAbUEz5dVR7eeOuV5I8X7TY0W8jvqwJjJloejqx93N_2T5YSxOTAMXiA9efgeiB8KgbhZPT7pBXIHg7jWNbE",
  },
];

const scheduleItems: ScheduleItem[] = [
  {
    time: "Mai, 09:00 AM",
    title: "Bàn giao thiết bị cho Hoàng Minh Anh",
    location: "Quận 1, TP. Hồ Chí Minh",
    active: true,
    hasLine: true,
  },
  {
    time: "26 Tháng 5, 02:00 PM",
    title: "Bàn giao DJI RS 3 cho Lê Thị Thuỷ",
    location: "Giao tận nơi - Quận 7",
    hasLine: true,
  },
  {
    time: "28 Tháng 5, 05:00 PM",
    title: "Nhận lại máy Canon EOS R5",
    location: "Tại studio của bạn",
  },
];

function Icon({ name, filled = false }: { name: string; filled?: boolean }) {
  return (
    <span
      className="material-symbols-outlined"
      style={
        filled
          ? ({ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' } as React.CSSProperties)
          : undefined
      }
    >
      {name}
    </span>
  );
}

function OverviewPage() {
  return (
    <div className="dashboard-page overview-page">
      <aside className="overview-sidebar">
        <div className="overview-sidebar__brand">
          <div className="overview-sidebar__brand-icon">
            <Icon name="camera" filled />
          </div>
          <div>
            <h1>Aperture Exchange</h1>
            <p>Người cho thuê chuyên nghiệp</p>
          </div>
        </div>

        <nav className="overview-sidebar__nav">
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`overview-sidebar__nav-item ${item.active ? "is-active" : ""}`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="overview-sidebar__footer">
          <button className="dashboard-btn-primary overview-sidebar__add-btn">
            <Icon name="add" />
            <span>Thêm thiết bị mới</span>
          </button>

          <div className="overview-sidebar__profile">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuANe5XdZ31XiBCFgDFuzIbJ8R_wnrrZ94ZpURtomvMotQC5_32c729J8yP1GUEH-QJqGuRWJqKQBFqx3RFt_BpkvEHpugxxB0ZZy4GbGOs9XWFyXdCpwkjLJiNXRcIU0VLwsfzMVozGTf1bWbNaqm0WdOnsv7re8YaVaMPOYb83g-AJOnaReQ2RRxVzbDvBXuRrgBXGoW3i11Ypmmmqm88ox4R00LXKsGYQjiMAG2nUz07txnIF20fVaqKbBPB6I_7KP1erg7BboBM"
              alt="Lender Profile"
            />
            <div className="overview-sidebar__profile-info">
              <p className="overview-sidebar__profile-name">Marcus Nguyen</p>
              <p className="overview-sidebar__profile-role">Premium Lender</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="overview-main">
        <header className="overview-topbar">
          <div className="overview-topbar__search">
            <Icon name="search" />
            <input type="text" placeholder="Tìm kiếm yêu cầu hoặc thiết bị..." />
          </div>

          <div className="overview-topbar__actions">
            <button className="overview-topbar__icon-btn" aria-label="Thông báo">
              <Icon name="notifications" />
              <span className="overview-topbar__dot" />
            </button>

            <button className="overview-topbar__icon-btn" aria-label="Trợ giúp">
              <Icon name="help_outline" />
            </button>

            <div className="overview-topbar__divider" />

            <div className="overview-topbar__membership">
              <span>Thành viên Pro</span>
              <div className="overview-topbar__membership-badge">
                <Icon name="star" filled />
              </div>
            </div>
          </div>
        </header>

        <div className="overview-content">
          <section className="overview-header">
            <div>
              <h2>Chào buổi sáng, Marcus!</h2>
              <p>
                <Icon name="calendar_month" />
                <span>Thứ Tư, ngày 24 tháng 5, 2024</span>
              </p>
            </div>

            <button className="overview-report-btn">Xuất báo cáo</button>
          </section>

          <section className="overview-stats-grid">
            {statItems.map((item) => (
              <article key={item.title} className="dashboard-card overview-stat-card">
                <div className={`overview-stat-card__accent is-${item.accent}`} />
                <p className="overview-stat-card__label">{item.title}</p>

                {item.extra ? (
                  <div className="overview-stat-card__row">
                    <h3 className={item.valueClassName}>{item.value}</h3>
                    <span
                      className={`overview-stat-card__badge ${
                        item.extraType === "success" ? "is-success" : "is-neutral"
                      }`}
                    >
                      {item.extra}
                    </span>
                  </div>
                ) : item.showPulse ? (
                  <div className="overview-stat-card__row is-space-between">
                    <h3>{item.value}</h3>
                    <span className="overview-stat-card__pulse" />
                  </div>
                ) : (
                  <h3 className={item.valueClassName}>{item.value}</h3>
                )}
              </article>
            ))}
          </section>

          <section className="overview-layout">
            <div className="overview-main-column">
              <section>
                <div className="overview-section-head">
                  <h3>Yêu cầu thuê mới</h3>
                  <a href="#">Xem tất cả</a>
                </div>

                <div className="overview-request-list">
                  {rentalRequests.map((request) => (
                    <article key={`${request.name}-${request.equipment}`} className="dashboard-card overview-request-card">
                      <img
                        src={request.avatar}
                        alt={request.name}
                        className="overview-request-card__avatar"
                      />

                      <div className="overview-request-card__content">
                        <div className="overview-request-card__meta">
                          <span className="overview-request-card__name">{request.name}</span>
                          <span className="overview-request-card__verified">
                            • {request.verifiedLabel}
                          </span>
                        </div>

                        <p className="overview-request-card__equipment">{request.equipment}</p>
                        <p className="overview-request-card__date">{request.dateRange}</p>
                      </div>

                      <div className="overview-request-card__actions">
                        <span className="overview-request-card__price">{request.price}</span>

                        <div className="overview-request-card__buttons">
                          <button className="dashboard-btn-primary overview-approve-btn">
                            Phê duyệt
                          </button>
                          <button className="dashboard-btn-surface overview-reject-btn">
                            Từ chối
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section>
                <div className="overview-section-head">
                  <h3>Thiết bị đang cho thuê</h3>

                  <div className="overview-slider-nav">
                    <button aria-label="Trước">
                      <Icon name="chevron_left" />
                    </button>
                    <button aria-label="Sau">
                      <Icon name="chevron_right" />
                    </button>
                  </div>
                </div>

                <div className="overview-rented-grid">
                  {rentedItems.map((item) => (
                    <article key={item.title} className="dashboard-card overview-rented-card">
                      <div className="overview-rented-card__image-wrap">
                        <img src={item.image} alt={item.title} />
                        <span className="overview-rented-card__status">Đang thuê</span>
                      </div>

                      <div className="overview-rented-card__body">
                        <h4>{item.title}</h4>
                        <p>Khách thuê: {item.renter}</p>

                        <div className="overview-rented-card__footer">
                          <div>
                            <span>Ngày trả</span>
                            <strong>{item.returnDate}</strong>
                          </div>

                          <button className="overview-rented-card__message-btn" aria-label="Nhắn tin">
                            <Icon name="message" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="overview-side-column">
              <section className="overview-revenue-card">
                <div className="overview-revenue-card__top">
                  <span>Phân tích doanh thu</span>
                  <Icon name="trending_up" />
                </div>

                <div className="overview-revenue-card__value">
                  <p>45.200k</p>
                  <span>Tổng thu nhập năm 2024</span>
                </div>

                <div className="overview-revenue-card__progress">
                  <div className="overview-revenue-card__progress-track">
                    <div className="overview-revenue-card__progress-value" />
                  </div>
                  <strong>65%</strong>
                </div>

                <p className="overview-revenue-card__quote">
                  "Doanh thu của bạn cao hơn 15% so với mặt bằng chung các nhà
                  cung cấp cùng khu vực."
                </p>
              </section>

              <section className="dashboard-card overview-schedule-card">
                <h3>Lịch trình sắp tới</h3>

                <div className="overview-timeline">
                  {scheduleItems.map((item, index) => (
                    <div key={`${item.time}-${index}`} className="overview-timeline__item">
                      <div className="overview-timeline__rail">
                        <span className={`overview-timeline__dot ${item.active ? "is-active" : ""}`} />
                        {item.hasLine && <span className="overview-timeline__line" />}
                      </div>

                      <div className="overview-timeline__content">
                        <p className={`overview-timeline__time ${item.active ? "is-active" : ""}`}>
                          {item.time}
                        </p>
                        <h4>{item.title}</h4>
                        <span>{item.location}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="dashboard-btn-surface overview-schedule-btn">
                  Xem toàn bộ lịch
                </button>
              </section>

              <section className="overview-trust-card">
                <div className="overview-trust-card__icon">
                  <Icon name="verified" filled />
                </div>

                <div>
                  <p className="overview-trust-card__title">Chủ sở hữu tin cậy</p>
                  <p className="overview-trust-card__desc">
                    Bạn đã duy trì 5 sao trong 12 tháng qua.
                  </p>
                </div>
              </section>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}

export default OverviewPage;