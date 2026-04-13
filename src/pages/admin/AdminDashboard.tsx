import React from "react";
import "../../styles/AdminDashboard.css";
import "../../styles/dashboard.css";

interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
}

interface EkycUser {
  name: string;
  email: string;
  submittedAt: string;
  avatar?: string;
  initials?: string;
}

interface DisputeItem {
  id: string;
  title: string;
  description: string;
  status: string;
  statusType: "primary" | "error";
  image: string;
  avatars: string[];
}

const navItems: NavItem[] = [
  { icon: "dashboard", label: "Tổng quan", active: true },
  { icon: "camera_roll", label: "Đơn thuê" },
  { icon: "account_balance_wallet", label: "Ví của tôi" },
  { icon: "gavel", label: "Tranh chấp" },
  { icon: "settings", label: "Cài đặt" },
];

const ekycUsers: EkycUser[] = [
  {
    name: "Nguyễn Minh Tuấn",
    email: "tuan.nm@gmail.com",
    submittedAt: "10:24, Hôm nay",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCslLHbsyJjxN8kTCDNwlX5K0nP8uH0l2TfITJsLD22iGXDEE_56QVRCsyvAtwL_KUDtIrnXSpPOKEVFkWKw9tdYIr9QwyIOm5sBkaJMi0qOY-maAZRse21MBK-B5Bo0Sbm1kU-vy8BiwAfbKLP23LayGeLdl4l9UGWIfL04_MQ9HOyxjy6vvPdkEFSyEttywjgyXaEPcfVuNgMhR3q1QFcq1scUz0yB9Xq5UIDjWQNaZil_Y10QeVP0U-2lvKpAXv8TDv0lktC3VM",
  },
  {
    name: "Lê Thị Mai Anh",
    email: "maianh.creative@outlook.com",
    submittedAt: "09:15, Hôm nay",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCV0oMX7dcOzUy2bdXKg7LSNBXZyyFqCI22eAJkhb6tgDIvb-M9gI51QwCMFzxDfYmvFLWFjhuMv8hzBapwl0lAG1Bc-mc7H5NzOdwJhj4lxMGdV9MJIaMcar7WFXClauMtK_bMlMrep26Me3eoGaYorxkh8Jr6kav0Xn_Ea9TEc5Uu96ZclTglqtIaHsu7gNGtAHpZveEmB5i9AlN50RTFUEwRVrtoSbZfRCcGm82RgcGt-xsPuriOjTarOuDlSE7dEozun9OwS7s",
  },
  {
    name: "Phạm Thành Trung",
    email: "trung.pham@studio.vn",
    submittedAt: "Hôm qua",
    initials: "PT",
  },
];

const disputes: DisputeItem[] = [
  {
    id: "#DIS-9842",
    title: "Hư hỏng thiết bị: Sony A7R V",
    description:
      "Người thuê báo cáo thiết bị bị trầy xước kính trước sau khi nhận, người cho thuê phủ nhận...",
    status: "Đang xác minh",
    statusType: "primary",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCq3HPuizRFUbviNUytj4yJTKFdyNzy20rYxWRL8SIJ_U8Uk6EYMcxOmOqAe-UQGy_2EJ7Q8IZtB9ZaV2l779Wj_cTNf4VL8fUoPaPiaPkGcqsTCBYhvEJQrJBMjAAVOaYrLwOpRNg3eufpUlHBQihX5Kwey2p8KqXxiiQtknlg9YjlsWJcwbIrx2RtxpkRz5lLSnpwFgKxm57pvgzFZZv0tKH_7mzVdtHoT0qzkzx7YrhS9M4N3UXespcLnXrfDwiXf23v-3290Tc",
    avatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBF_MgRtL33uB46t_VPcBccaWtDb-sl2gzrtUL8rYYRmknuLow5v5vE_jLGWoV0nsVjzsIE9LmluYkX8sREvi-SE0klPc6hHz2xaH8D7QxPncu2WSNQmvRBnaBKBJg3ngcDmRAVrboTNMHOBCc6KC3RfjSiJdJ5oNv3CUI_l68i9Wjupq3QKBPMFwrUOWiMhRhDW3zWNhbejOvcNwIRbJia5cF3vtlnmc0ovSNX-CfGuH0B2dWYs9S_EP6q7K2USFqz2OcfEvJ3nQE",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCz02Q9zHGLyNijLi6fDmksK4YRBgUMTgBPyFYd5kfJvbS96rURWdGRtfkbWYlUWft9QnTjQxZ5-ISOFwVEdB7Gf3MUsetssIaD0dJ5mHACWkZNbUR-khdQXKPeFggO1wZoau8_AYqAVfFmsmplGZQE63yIJjymq3nMtlgoYfNb-zpOCFIfhIaMxlmX8WyGZVi5zR-aJfgw9wEPjQrErDecPWoNrjnMCpNmb_6OJCIUdvGioQr0LwDjHERGwWiJJObBGrk8B-jcMzE",
    ],
  },
  {
    id: "#DIS-9839",
    title: "Quá hạn trả: Combo Canon EOS R5",
    description:
      "Người thuê trễ hạn 48h và không phản hồi tin nhắn từ phía người cho thuê hệ thống...",
    status: "Khẩn cấp",
    statusType: "error",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgGfqcJ94EkaTSkN7mQZ0MfRmpgLOW3tDadIC5sLNH7ktMK6xlhGjfcmBiTbsuS9II6LgIFqZ9l4dhhWp4vCXO4zH8_WGLLwl2asXG2q8AVawZaf2TUvaNQJ3rC5eyxsarYZfVhtdNvbsd4fRkhm1GQtkw5LcmAKqhUTkHQLv5L9XdTMOqQ4dvVVgm8E3U0tm5Ld33QLFuzg-Aq0EQNmrQ7Us39cz_THRAoGQ0C15GxxICQOHcYhdp-Vc-anOmR4DNqoeOdOSA0dg",
    avatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCuZ5BE1H1YZnsJJLWRZh314DFGyolQ8bkcEyoXVCMedTiqadhQw2mRAMOCDhodT7ZidGi2VWt22-CTzSKhXp-qBTkt47Iybcr8-kUgNJ-9WSi-IWz_ft9S3bJKVEd1RXjgk75UPDMHp7yCzlydlbv6YrRA3bO6dJchFnJWkWNuC2vpmlFVPQt_EVIiIGPlVZdEQXfKDhRbWLl2vbwyKf8Jblh38hB3azk2VZ0oKuJaIRXrpE3VReMK5Sbjl9Maan9nQj0Vm2mTDVg",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDpFtkByepmdWSsGASEyPODdxW--7Zitg2LkqUQ6NoV8TAhkA-OGXwqeOwiaOQii9tB5wd7vk9w9U6Bc6Vhx3-Pt9gTmNoIN8ZLcXWlf4xhjjEviKbazveQoXxzjg6jP3mzsJWmnal9T7Cjn9_S7ExD9Mic01sSge1pnVFIKoXcTusxbrIN0J4EFz9JKRFheOfT_Wt_AcQNZOm_mMBlDheUI0_jSMTEWL_74ULFIKC...".replace("...", ""),
    ],
  },
];

const chartBars = [40, 65, 50, 85, 100];

const Icon = ({ name }: { name: string }) => (
  <span className="material-symbols-outlined">{name}</span>
);

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>LensLease VN</h1>
          <p>Technical Curator</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`nav-item ${item.active ? "active" : ""}`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="primary-btn">Đăng thiết bị</button>
        </div>
      </aside>

      <header className="topbar">
        <div className="search-box">
          <Icon name="search" />
          <input
            type="text"
            placeholder="Tìm kiếm giao dịch, người dùng..."
          />
        </div>

        <div className="topbar-right">
          <button className="icon-btn notification-btn">
            <Icon name="notifications" />
            <span className="notification-dot" />
          </button>

          <button className="icon-btn">
            <Icon name="help" />
          </button>

          <div className="user-box">
            <div className="user-info">
              <p className="user-name">Admin Curator</p>
              <p className="user-role">Quản trị viên</p>
            </div>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQxrJWLfLqLtuwaJIu-T3az-XEdUSYosmXeu7wR4VYCPQ4TPWcDtnA2BbHgy3yuoITj-YiX5gB5p6QWkyz2iTJHwhPUYSAgDsBAtPPLXYhyrD1hPWlEW_6WbdDVCaFy7og8Deuv_KmNp-uZtiIKcWxlOgEWSedIzx8-7SKLFXNo6nwjVxFl03la7uO31ErboXCvzpXEUNcsE5VkhAHOi-cHGM2vpzBjBFk5U9E56cCHGLpYOC5rbhsOWIhIRdGH5Qu4aqoKD_Mpeg"
              alt="Admin"
              className="user-avatar"
            />
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="welcome-section">
          <h2>Trung tâm Quản trị</h2>
          <p>
            Chào mừng trở lại, hệ thống đang vận hành ổn định với 12 yêu cầu
            eKYC mới.
          </p>
        </section>

        <section className="kpi-grid">
          <div className="card revenue-card">
            <div className="revenue-content">
              <p className="card-label">Doanh thu hệ thống (Tháng này)</p>
              <h3>1.284.000.000đ</h3>
              <div className="trend-row">
                <Icon name="trending_up" />
                <span>+14.2% so với tháng trước</span>
              </div>
            </div>
            <div className="revenue-glow" />
          </div>

          <div className="card kpi-card">
            <div>
              <div className="kpi-icon primary-bg">
                <Icon name="camera_roll" />
              </div>
              <p className="kpi-label">Đơn thuê đang chạy</p>
              <h4>482</h4>
            </div>
            <p className="kpi-subtext">24 đơn hoàn thành hôm nay</p>
          </div>

          <div className="card kpi-card">
            <div>
              <div className="kpi-icon error-bg">
                <Icon name="gavel" />
              </div>
              <p className="kpi-label">Tranh chấp cần xử lý</p>
              <h4 className="text-error">08</h4>
            </div>
            <p className="kpi-subtext text-error">Cần ưu tiên xử lý gấp</p>
          </div>
        </section>

        <section className="content-grid">
          <div className="card panel-card large-panel">
            <div className="panel-header">
              <h3>Phê duyệt eKYC Pending</h3>
              <button className="text-btn">
                Xem tất cả <Icon name="arrow_forward" />
              </button>
            </div>

            <div className="table-header">
              <div className="col-user">Người dùng</div>
              <div>Ngày gửi</div>
              <div className="col-action">Hành động</div>
            </div>

            <div className="ekyc-list">
              {ekycUsers.map((user) => (
                <div className="ekyc-row" key={user.email}>
                  <div className="col-user user-cell">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="ekyc-avatar"
                      />
                    ) : (
                      <div className="ekyc-avatar initials-avatar">
                        {user.initials}
                      </div>
                    )}

                    <div>
                      <p className="ekyc-name">{user.name}</p>
                      <p className="ekyc-email">{user.email}</p>
                    </div>
                  </div>

                  <div className="submitted-time">{user.submittedAt}</div>

                  <div className="col-action action-group">
                    <button className="action-btn reject-btn">
                      <Icon name="close" />
                    </button>
                    <button className="action-btn approve-btn">
                      <Icon name="check" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card panel-card growth-card">
            <h3>Tăng trưởng hệ thống</h3>

            <div className="growth-body">
              <div>
                <div className="chart-bars">
                  {chartBars.map((height, index) => (
                    <div
                      key={index}
                      className={`chart-bar bar-${index + 1}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>

                <div className="chart-labels">
                  <span>T2</span>
                  <span>T3</span>
                  <span>T4</span>
                  <span>T5</span>
                  <span>T6</span>
                </div>
              </div>

              <div className="growth-stats">
                <div className="growth-row">
                  <span>Thiết bị mới</span>
                  <strong>+124</strong>
                </div>
                <div className="growth-row">
                  <span>Người dùng mới</span>
                  <strong>+2.4k</strong>
                </div>

                <div className="system-tip">
                  <div className="system-tip-title">
                    <Icon name="info" />
                    <p>Gợi ý hệ thống</p>
                  </div>
                  <p>
                    Nhu cầu thuê Lens Sony G-Master đang tăng cao 30% tại khu
                    vực TP.HCM.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="disputes-section">
          <div className="section-header">
            <h3>Tranh chấp pháp lý mới</h3>
            <span className="badge badge-error">Cần xử lý</span>
          </div>

          <div className="disputes-grid">
            {disputes.map((dispute) => (
              <div className="card dispute-card" key={dispute.id}>
                <div className="dispute-image-wrap">
                  <img
                    src={dispute.image}
                    alt={dispute.title}
                    className="dispute-image"
                  />
                </div>

                <div className="dispute-content">
                  <div className="dispute-top">
                    <h4>{dispute.title}</h4>
                    <span>{dispute.id}</span>
                  </div>

                  <p className="dispute-desc">{dispute.description}</p>

                  <div className="dispute-bottom">
                    <div className="avatar-stack">
                      {dispute.avatars.map((avatar, index) => (
                        <img
                          key={index}
                          src={avatar}
                          alt={`user-${index + 1}`}
                          className="stack-avatar"
                        />
                      ))}
                    </div>

                    <span
                      className={`status-text ${
                        dispute.statusType === "error"
                          ? "text-error"
                          : "text-primary"
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;