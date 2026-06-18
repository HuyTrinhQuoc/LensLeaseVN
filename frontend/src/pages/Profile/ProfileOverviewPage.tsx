import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { userService, type UserProfile } from '../../services/user.service';
import { ownerApplicationService, type OwnerApplication } from '../../services/owner-application.service';
import { getRoleFromToken } from '../../utils/auth';

const ROLE_LABEL: Record<string, string> = {
  USER: 'Người thuê',
  OWNER: 'Chủ cho thuê',
  ADMIN: 'Quản trị viên',
};

const KYC_LABEL: Record<string, string> = {
  APPROVED: 'Đã xác minh',
  PENDING: 'Chờ duyệt',
  REJECTED: 'Bị từ chối',
};

function kycLabel(status?: string | null) {
  if (!status) return 'Chưa xác minh';
  return KYC_LABEL[status] || status;
}

export default function ProfileOverviewPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [application, setApplication] = useState<OwnerApplication | null>(null);
  const [loading, setLoading] = useState(true);

  const role = getRoleFromToken()?.toUpperCase() || profile?.role || 'USER';
  const isOwner = role === 'OWNER' || role === 'ADMIN';

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [meRes, appRes] = await Promise.all([
          userService.getMe(),
          ownerApplicationService.getMine(),
        ]);
        if (!cancelled) {
          setProfile(meRes.data);
          setApplication(appRes.data?.data ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="profile-hub__card">
        <p className="text-sm text-gray-500">Đang tải…</p>
      </div>
    );
  }

  const ownerStatus = isOwner
    ? 'Đã kích hoạt'
    : application?.status === 'PENDING'
      ? 'Chờ admin duyệt'
      : application?.status === 'REJECTED'
        ? 'Đã từ chối — có thể gửi lại'
        : 'Chưa đăng ký';

  return (
    <>
      <div className="profile-hub__card">
        <h1 className="profile-hub__card-title">Tài khoản của tôi</h1>
        <p className="profile-hub__card-sub">
          Quản lý hồ sơ, đơn thuê và (nếu bạn muốn) đăng ký cho thuê thiết bị trên LensLease.
        </p>

        <div className="profile-hub__status-grid">
          <div className="profile-hub__status-tile">
            <div className="profile-hub__status-tile-label">Vai trò hiện tại</div>
            <div className="profile-hub__status-tile-value">{ROLE_LABEL[role] || role}</div>
          </div>
          <div className="profile-hub__status-tile">
            <div className="profile-hub__status-tile-label">Xác minh KYC (để thuê máy)</div>
            <div className="profile-hub__status-tile-value">{kycLabel(profile?.kyc_status)}</div>
          </div>
          <div className="profile-hub__status-tile">
            <div className="profile-hub__status-tile-label">Tài khoản chủ cho thuê</div>
            <div className="profile-hub__status-tile-value">{ownerStatus}</div>
          </div>
        </div>

        {!isOwner && application?.status !== 'PENDING' ? (
          <div className="profile-hub__cta-owner">
            <div>
              <h3>Bạn có máy ảnh / lens muốn cho thuê?</h3>
              <p>
                Đăng ký làm chủ cho thuê trên LensLease — sau khi admin duyệt, bạn có thể đăng tin thiết bị và
                nhận đơn thuê. <strong>Khác với KYC</strong> (xác minh CCCD khi bạn đi thuê máy).
              </p>
            </div>
            <Link to="/profile/become-owner" className="profile-hub__btn-primary">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              Đăng ký chủ cho thuê
            </Link>
          </div>
        ) : null}

        {application?.status === 'PENDING' && !isOwner ? (
          <div className="profile-hub__alert profile-hub__alert--warn" style={{ marginTop: 20 }}>
            Đơn đăng ký chủ cho thuê của bạn đang <strong>chờ admin duyệt</strong>. Sau khi được duyệt, hãy{' '}
            <strong>đăng xuất và đăng nhập lại</strong> để thấy menu quản lý cho thuê.
          </div>
        ) : null}

        {application?.status === 'REJECTED' && !isOwner ? (
          <div className="profile-hub__alert profile-hub__alert--error" style={{ marginTop: 20 }}>
            Đơn đăng ký trước đó bị từ chối
            {application.admin_note ? `: ${application.admin_note}` : ''}. Bạn có thể gửi đơn mới.
          </div>
        ) : null}

        {isOwner ? (
          <>
            <p className="mt-6 text-sm font-semibold text-gray-700">Bảng điều khiển chủ cho thuê</p>
            <div className="profile-hub__owner-links">
              <Link to="/dashboard/new-listing" className="profile-hub__owner-link">
                <span className="material-symbols-outlined">add_circle</span>
                Đăng tin mới
              </Link>
              <Link to="/dashboard/my-listings" className="profile-hub__owner-link">
                <span className="material-symbols-outlined">photo_camera</span>
                Thiết bị của tôi
              </Link>
              <Link to="/dashboard/orders" className="profile-hub__owner-link">
                <span className="material-symbols-outlined">assignment</span>
                Đơn cho thuê
              </Link>
              <Link to="/dashboard/stats" className="profile-hub__owner-link">
                <span className="material-symbols-outlined">payments</span>
                Doanh thu
              </Link>
            </div>
          </>
        ) : null}
      </div>

      <div className="profile-hub__card">
        <h2 className="profile-hub__card-title" style={{ fontSize: 16 }}>
          Hai luồng độc lập
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-gray-600">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="font-bold text-gray-900 mb-1">KYC — Người thuê</p>
            <p>Xác minh CCCD để đặt thuê thiết bị trên sàn.</p>
            <Link to="/Verification" className="mt-2 inline-block text-[#0b45b3] font-semibold text-sm">
              Đi tới xác minh KYC →
            </Link>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="font-bold text-gray-900 mb-1">Đăng ký chủ — Người cho thuê</p>
            <p>Xin quyền đăng tin và quản lý thiết bị của bạn.</p>
            {!isOwner ? (
              <Link to="/profile/become-owner" className="mt-2 inline-block text-[#0b45b3] font-semibold text-sm">
                Đăng ký chủ cho thuê →
              </Link>
            ) : (
              <Link to="/dashboard/new-listing" className="mt-2 inline-block text-[#0b45b3] font-semibold text-sm">
                Đăng tin thiết bị →
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
