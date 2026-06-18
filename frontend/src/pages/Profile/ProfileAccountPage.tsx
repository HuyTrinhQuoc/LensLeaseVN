import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService, type UserProfile } from '../../services/user.service';
import { getAuthToken } from '../../utils/auth';

export default function ProfileAccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login', { replace: true });
      return;
    }
    void userService.getMe().then((res) => {
      const u = res.data;
      setProfile(u);
      setFullName(u.full_name || '');
      setPhone(u.phone || '');
      setAddress(u.address || '');
      setBio(u.bio || '');
      setAvatarUrl(u.avatar_url || '');
      setLoading(false);
    });
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await userService.updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
      });
      setProfile(res.data);
      localStorage.setItem('fullName', res.data.full_name || '');
      if (res.data.avatar_url) localStorage.setItem('picture', res.data.avatar_url);
      setSuccess('Đã cập nhật hồ sơ thành công.');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || 'Không thể lưu hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-hub__card">
        <p className="text-sm text-gray-500">Đang tải…</p>
      </div>
    );
  }

  return (
    <div className="profile-hub__card">
      <h1 className="profile-hub__card-title">Thông tin cá nhân</h1>
      <p className="profile-hub__card-sub">Cập nhật họ tên, liên hệ và ảnh đại diện.</p>

      {error ? <div className="profile-hub__alert profile-hub__alert--error">{error}</div> : null}
      {success ? <div className="profile-hub__alert profile-hub__alert--success">{success}</div> : null}

      {profile ? (
        <p className="mb-4 text-sm text-gray-500">
          Email: <span className="font-mono text-gray-800">{profile.email}</span>
        </p>
      ) : null}

      <form onSubmit={(e) => void handleSave(e)}>
        <div className="profile-hub__form-field">
          <label>Họ và tên *</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="profile-hub__form-field">
          <label>Số điện thoại</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="profile-hub__form-field">
          <label>Địa chỉ</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="profile-hub__form-field">
          <label>URL ảnh đại diện</label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="profile-hub__form-field">
          <label>Giới thiệu</label>
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={saving} className="profile-hub__btn-primary">
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
          <Link to="/profile" className="profile-hub__btn-outline">
            Quay lại tổng quan
          </Link>
        </div>
      </form>
    </div>
  );
}
