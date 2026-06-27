import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userService } from '../../services/user.service';
import { ownerApplicationService, type OwnerApplication } from '../../services/owner-application.service';
import { getAuthToken, getRoleFromToken } from '../../utils/auth';

const EQUIPMENT_OPTIONS = [
  'Máy ảnh DSLR / Mirrorless',
  'Ống kính (Lens)',
  'Máy quay / Action cam',
  'Tripod / Gimbal',
  'Đèn studio / Flash',
  'Flycam / Drone',
  'Phụ kiện khác',
];

export default function BecomeOwnerPage() {
  const navigate = useNavigate();
  const role = getRoleFromToken()?.toUpperCase();

  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState<OwnerApplication | null>(null);

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login', { replace: true });
      return;
    }
    if (role === 'OWNER' || role === 'ADMIN') {
      navigate('/dashboard/new-listing', { replace: true });
      return;
    }

    void (async () => {
      try {
        const [meRes, appRes] = await Promise.all([
          userService.getMe(),
          ownerApplicationService.getMine(),
        ]);
        setPhone(meRes.data.phone || '');
        setApplication(appRes.data?.data ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, role]);

  const toggleType = (label: string) => {
    setSelectedTypes((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !area.trim()) {
      toast.error('Vui lòng nhập số điện thoại và khu vực');
      return;
    }
    if (selectedTypes.length === 0) {
      toast.error('Chọn ít nhất một loại thiết bị bạn muốn cho thuê');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ownerApplicationService.submit({
        phone: phone.trim(),
        area: area.trim(),
        equipment_types: selectedTypes.join(', '),
        description: description.trim() || undefined,
      });
      setApplication(res.data.data);
      toast.success('Đã gửi đơn đăng ký! Admin sẽ xem xét trong thời gian sớm nhất.');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Không gửi được đơn đăng ký');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-hub__card">
        <p className="text-sm text-gray-500">Đang tải…</p>
      </div>
    );
  }

  if (application?.status === 'PENDING') {
    return (
      <div className="profile-hub__card">
        <h1 className="profile-hub__card-title">Đơn đang chờ duyệt</h1>
        <div className="profile-hub__alert profile-hub__alert--warn">
          Bạn đã gửi đơn đăng ký chủ cho thuê lúc{' '}
          {new Date(application.created_at).toLocaleString('vi-VN')}. Vui lòng chờ admin duyệt.
        </div>
        <dl className="space-y-2 text-sm text-gray-700">
          <div>
            <dt className="text-gray-500">Số điện thoại</dt>
            <dd className="font-semibold">{application.phone}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Khu vực</dt>
            <dd className="font-semibold">{application.area}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Thiết bị dự kiến cho thuê</dt>
            <dd className="font-semibold">{application.equipment_types}</dd>
          </div>
        </dl>
        <Link to="/profile" className="profile-hub__btn-outline mt-6 inline-flex">
          Về tổng quan tài khoản
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-hub__card">
      <h1 className="profile-hub__card-title">Đăng ký chủ cho thuê</h1>
      <p className="profile-hub__card-sub">
        Gửi thông tin để LensLease xem xét cấp quyền <strong>chủ cho thuê (OWNER)</strong>. Đây là bước
        riêng với <strong>KYC</strong> (xác minh CCCD khi bạn đi thuê máy người khác).
      </p>

      {application?.status === 'REJECTED' ? (
        <div className="profile-hub__alert profile-hub__alert--error">
          Đơn trước bị từ chối{application.admin_note ? `: ${application.admin_note}` : ''}. Bạn có thể
          gửi đơn mới bên dưới.
        </div>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className="profile-hub__form-field">
          <label>Họ tên (từ hồ sơ)</label>
          <input disabled value="Lấy từ tài khoản đã đăng nhập" className="bg-gray-50 text-gray-500" />
        </div>
        <div className="profile-hub__form-field">
          <label>Số điện thoại liên hệ *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0901234567"
            required
          />
        </div>
        <div className="profile-hub__form-field">
          <label>Khu vực hoạt động chính *</label>
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="VD: Quận 1, TP. Hồ Chí Minh"
            required
          />
        </div>
        <div className="profile-hub__form-field">
          <label>Bạn muốn cho thuê loại thiết bị nào? *</label>
          <div className="profile-hub__check-grid">
            {EQUIPMENT_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`profile-hub__check-pill${selectedTypes.includes(opt) ? ' profile-hub__check-pill--on' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(opt)}
                  onChange={() => toggleType(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
        <div className="profile-hub__form-field">
          <label>Mô tả thêm (tùy chọn)</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="VD: Tôi có Sony A7IV, 24-70 GM II, sẵn sàng cho thuê cuối tuần tại Q1..."
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={submitting} className="profile-hub__btn-primary">
            {submitting ? 'Đang gửi…' : 'Gửi đăng ký'}
          </button>
          <Link to="/profile" className="profile-hub__btn-outline">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
