import "../styles/UserDashboard.css";
import "../styles/dashboard.css";

interface SidebarItem {
  icon: string;
  label: string;
  active?: boolean;
}

interface KycItem {
  name: string;
  uploadedAgo: string;
  citizenIdMasked: string;
  level: string;
  avatar: string;
}

interface ComplaintItem {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  status: string;
  statusType: "error" | "primary";
  actionLabel: string;
}

interface ActivityItem {
  time: string;
  subject: string;
  action: string;
  status: string;
  statusType: "primary" | "error" | "warning";
  avatar?: string;
  icon?: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: "list_alt", label: "Đơn thuê của tôi" },
  { icon: "history_edu", label: "Biên bản bàn giao" },
  { icon: "account_balance", label: "Ví ký quỹ" },
  { icon: "support_agent", label: "Trung tâm tranh chấp" },
  { icon: "dashboard_customize", label: "Quản lý hệ thống", active: true },
];

const kycItems: KycItem[] = [
  {
    name: "Lê Minh Tuấn",
    uploadedAgo: "Đã tải lên 2 giờ trước",
    citizenIdMasked: "079xxxxxx541",
    level: "Cấp 3",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuACkvHoGq9I_4QNdHoGHEJv6T_NrbG19f2xOLBP86dpcAwenh671jzyrC-GMrQh5V4fyk4ZuE4R6hhz_do7m5KTr_096tVvrCRmKNPdl81OtcPdNNtcE79oA8PhhaHHy1Kcp_tUz0nF4DuGNM2Mk6WfLRo4J6PqlnqIWVZE7UNF3g9EViV9ETlvemwG25mWV8-5ACf6Ae0iajUklzjyisG9vxIza1zGl5_oLEPH1-45e4REYz9yfXSycSJ1gehDGK4CHqTr-DE7kaY",
  },
  {
    name: "Nguyễn Thị Mai",
    uploadedAgo: "Đã tải lên 5 giờ trước",
    citizenIdMasked: "031xxxxxx112",
    level: "Cấp 2",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCyMG20E4b_7Z3Iymi71_IloBftRCKqW5ElWom4SuSketrmZdLdHQTe8TZK_DKoUuhEiigh8-lsjl5YKYFMzvOqUE-4eEVPh9eMGxKc3VZO7YTUF_G_J6fUKFSwd0y2LsfLc6vb2T_vHwK5llUlLKU2aK0c-DDMCNsuK-qywk2p6VNHVz16GWpWpYGy6pi8MDRyrNA8ayP6rX2fX_rUjT61O368zjry1p_FbK7gfzZgVb2RdwmQQELpPzyqygPGEFRZhRdev6ry12Y",
  },
];

const complaintItems: ComplaintItem[] = [
  {
    id: "#TR-22091",
    title: "Trầy xước ống kính Sony 24-70mm GM II",
    description:
      "Bên thuê phản hồi thiết bị đã có vết xước trước khi nhận, bên cho thuê phủ nhận...",
    createdBy: "Hoàng Anh",
    status: "Khẩn cấp",
    statusType: "error",
    actionLabel: "Xử lý ngay",
  },
  {
    id: "#TR-22085",
    title: "Quá hạn trả máy 48 giờ",
    description:
      "Người thuê không liên lạc được, hệ thống tự động khóa tài khoản...",
    createdBy: "Vũ Thùy Linh",
    status: "Đang xử lý",
    statusType: "primary",
    actionLabel: "Cập nhật",
  },
];

const activities: ActivityItem[] = [
  {
    time: "14:22, 25/10",
    subject: "Phạm Quốc Hùng",
    action: "Nạp tiền vào ví (Momo)",
    status: "Thành công",
    statusType: "primary",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4kvC-5EcUshw6WwOUnhtvicgj0Sy8oVfhIXetcSu5RtghKfL541Rs0lshBN6yhChZxmfoWbuYjdRozbqmGU-Q5dXdJPmh-ps7-FwhuViWF3mgC8Zp6oCNM340y-gXksT4PCaQZtXOZvx_pD4lh5mLqqxQTslVU__Ra1ccRqeEHI4c-bk-3wJCR0YUyy5IBKpKf6SCDtU6GnN1cww7u0883kkThiFLPjeSMyCac3PczPB3ChnRH9pkNshIFX8QJNUTqS5hUKAhgFY",
  },
  {
    time: "12:05, 25/10",
    subject: "Canon R6 Mark II",
    action: "Đăng ký thiết bị mới",
    status: "Đang duyệt",
    statusType: "warning",
    icon: "camera_enhance",
  },
  {
    time: "09:30, 25/10",
    subject: "Trần Mỹ Linh",
    action: "Rút tiền ký quỹ",
    status: "Từ chối",
    statusType: "error",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwDN9zNAwxwOP0OvchJPr4DHNkwT-q8dJY4UPjC9Dw9Uc9vLLW8Zw5ipbcxKocPHcE9Yy8wyIGzg71cStlaN94XondGCPS7w82PCuaRkO0oRPSKKjdSXvfbySQ1TiDPMN-dQuoIOcDhZzQUa112ADsQC1e6c-SwSlmS5ono3Yn64KL0XnTw1C0FI-gJHLWH4ldbMyB18-wOki5cV73tI5hcomM2EZuQ8PDz7mag0ST4EkJw5X7zrIAhyLYJ-bws4fTFSIU-EPobxc",
  },
];

const mobileNavItems = [
  { icon: "camera_roll", label: "Thuê" },
  { icon: "account_balance_wallet", label: "Ví" },
  { icon: "gavel", label: "Tranh chấp" },
  { icon: "person", label: "Hồ sơ" },
  { icon: "admin_panel_settings", label: "Quản trị", active: true },
];

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

function UserDashboard() {
  return (
    <div className="dashboard-page tenant-system-page">
      <aside className="tenant-sidebar">
        <div className="tenant-sidebar__brand">
          <h1>Máy Ảnh &amp; Thuê</h1>
          <p>Admin Console</p>
        </div>

        <div className="tenant-sidebar__profile dashboard-card">
          <div className="tenant-sidebar__avatar">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDE2R3iMoQeYFzYTDSFmvTnbt0wtUS2kOyNa2NHgeAuF8WMtHFG11oC9ZOIir_su7ZD_gKeTAcR1vpedHdx_chJuYeetAm9w8itJQI7c_j-RJ9NUltfqpHpxhgZ41H_SNnXRgCx0NTOdkRUsUC41CXr-7DXjl1hJSSL9loSjZ332Aw-h3s4n6qJ8nv9K3U-KRw_ToaK0z4yuCAp3hIY4jAiXJ6IQ3BN6v0RSoYtCK0oWnpqAE8RMxA9jrguZkA82hXi4-BZ6SuhJ-0"
              alt="Người dùng chuyên nghiệp"
            />
          </div>

          <div>
            <p className="tenant-sidebar__profile-name">Người dùng Chuyên nghiệp</p>
            <p className="dashboard-subtitle">Xác minh: Cấp 3</p>
            <p className="tenant-sidebar__profile-id">ID: CAM-9921</p>
          </div>
        </div>

        <nav className="tenant-sidebar__nav">
          {sidebarItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`tenant-sidebar__nav-item ${item.active ? "is-active" : ""}`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="tenant-sidebar__footer">
          <button className="tenant-logout-btn">
            <Icon name="logout" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="tenant-main">
        <header className="tenant-topbar">
          <div className="tenant-topbar__left">
            <button className="tenant-menu-btn" aria-label="Mở menu">
              <Icon name="menu" />
            </button>
            <h2>Máy Ảnh &amp; Thuê</h2>
          </div>

          <div className="tenant-topbar__right">
            <div className="tenant-search">
              <Icon name="search" />
              <input type="text" placeholder="Tìm kiếm giao dịch..." />
            </div>

            <button className="tenant-wallet-btn" aria-label="Ví">
              <Icon name="account_balance_wallet" />
            </button>
          </div>
        </header>

        <div className="tenant-content">
          <section className="tenant-stats-grid">
            <div className="tenant-revenue-panel">
              <div className="tenant-revenue-panel__content">
                <h3>Tổng doanh thu hệ thống</h3>
                <p>482.500.000đ</p>

                <div className="tenant-trend-pill">
                  <Icon name="trending_up" />
                  <span>+12.5% so với tháng trước</span>
                </div>
              </div>

              <div className="tenant-revenue-panel__icon">
                <Icon name="payments" />
              </div>
            </div>

            <div className="dashboard-card tenant-stat-tile">
              <div className="dashboard-icon-tile dashboard-icon-tile-warning">
                <Icon name="pending_actions" />
              </div>
              <div>
                <h3>Chờ duyệt eKYC</h3>
                <p>14</p>
              </div>
            </div>

            <div className="dashboard-card tenant-stat-tile">
              <div className="dashboard-icon-tile dashboard-icon-tile-error">
                <Icon name="gavel" />
              </div>
              <div>
                <h3>Tranh chấp mới</h3>
                <p>03</p>
              </div>
            </div>
          </section>

          <section className="tenant-main-grid">
            <div className="tenant-panel">
              <div className="tenant-panel__header">
                <div className="tenant-panel__title-wrap">
                  <h2 className="dashboard-section-title">Duyệt eKYC</h2>
                  <span className="dashboard-badge dashboard-badge-primary">
                    Yêu cầu mới
                  </span>
                </div>

                <button className="tenant-link-btn">
                  Xem tất cả
                  <Icon name="arrow_forward" />
                </button>
              </div>

              <div className="tenant-request-list">
                {kycItems.map((item) => (
                  <article key={item.citizenIdMasked} className="tenant-request-card">
                    <div className="tenant-request-card__avatar">
                      <img src={item.avatar} alt={item.name} />
                    </div>

                    <div className="tenant-request-card__content">
                      <h4>{item.name}</h4>
                      <p>
                        {item.uploadedAgo} • CCCD: {item.citizenIdMasked}
                      </p>

                      <div className="tenant-request-card__badges">
                        <span className="dashboard-badge dashboard-badge-warning">
                          Đang chờ
                        </span>
                        <span className="dashboard-badge dashboard-badge-neutral">
                          {item.level}
                        </span>
                      </div>
                    </div>

                    <div className="tenant-request-card__actions">
                      <button className="dashboard-btn-primary">Duyệt</button>
                      <button
                        className="tenant-icon-btn"
                        aria-label={`Xem hồ sơ ${item.name}`}
                      >
                        <Icon name="visibility" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="tenant-panel">
              <div className="tenant-panel__header is-compact">
                <div className="tenant-panel__title-wrap">
                  <h2 className="dashboard-section-title">Khiếu nại</h2>
                </div>

                <div className="tenant-error-counter">3</div>
              </div>

              <div className="tenant-complaint-list">
                {complaintItems.map((item) => (
                  <article
                    key={item.id}
                    className={`tenant-complaint-card ${
                      item.statusType === "error"
                        ? "is-error"
                        : "is-primary"
                    }`}
                  >
                    <div className="tenant-complaint-card__top">
                      <span className="tenant-complaint-card__id">
                        ID: {item.id}
                      </span>

                      <span
                        className={`dashboard-badge ${
                          item.statusType === "error"
                            ? "dashboard-badge-error"
                            : "dashboard-badge-primary"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h4>{item.title}</h4>
                    <p>{item.description}</p>

                    <div className="tenant-complaint-card__bottom">
                      <span>
                        Bởi: <strong>{item.createdBy}</strong>
                      </span>

                      <button className="dashboard-btn-surface">
                        {item.actionLabel}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="dashboard-card tenant-activity-panel">
            <h3>Hoạt động hệ thống gần đây</h3>

            <div className="tenant-activity-table-wrap">
              <table className="tenant-activity-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Đối tượng</th>
                    <th>Hành động</th>
                    <th>Trạng thái</th>
                    <th className="align-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {activities.map((item, index) => (
                    <tr key={`${item.time}-${index}`}>
                      <td className="dashboard-soft">{item.time}</td>

                      <td>
                        <div className="tenant-subject">
                          <div className="tenant-subject__avatar">
                            {item.avatar ? (
                              <img src={item.avatar} alt={item.subject} />
                            ) : (
                              <Icon name={item.icon || "person"} />
                            )}
                          </div>
                          <span>{item.subject}</span>
                        </div>
                      </td>

                      <td>{item.action}</td>

                      <td>
                        <span
                          className={`tenant-status ${
                            item.statusType === "primary"
                              ? "is-primary"
                              : item.statusType === "error"
                              ? "is-error"
                              : "is-warning"
                          }`}
                        >
                          <span
                            className={`dashboard-dot ${
                              item.statusType === "primary"
                                ? "dashboard-dot-primary"
                                : item.statusType === "error"
                                ? "dashboard-dot-error"
                                : "dashboard-dot-warning"
                            }`}
                          />
                          {item.status}
                        </span>
                      </td>

                      <td className="align-right">
                        <button className="tenant-more-btn" aria-label="Thao tác khác">
                          <Icon name="more_vert" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <nav className="tenant-mobile-nav">
        {mobileNavItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`tenant-mobile-nav__item ${item.active ? "is-active" : ""}`}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

export default UserDashboard;