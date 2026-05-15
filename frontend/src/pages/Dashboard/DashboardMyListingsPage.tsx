import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getUserIdFromToken } from '../../utils/auth';

/**
 * DashboardMyListingsPage — Trang "Thiết bị của tôi"
 */
export default function DashboardMyListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setLoading(false);
      return;
    }

    api.get(`/lenses?owner_id=${userId}`)
      .then(res => {
        setListings(res.data.data || []);
      })
      .catch(err => {
        console.error('Lỗi khi tải danh sách thiết bị', err);
      })
      .finally(() => setLoading(false));
  }, []);

  function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ/ngày';
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'APPROVED': return <span style={{ color: '#059669', background: '#d1fae5', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold' }}>Đã duyệt</span>;
      case 'PENDING': return <span style={{ color: '#d97706', background: '#fef3c7', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold' }}>Chờ duyệt</span>;
      case 'REJECTED': return <span style={{ color: '#dc2626', background: '#fee2e2', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold' }}>Từ chối</span>;
      default: return null;
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px', marginBottom: 8 }}>
            Thiết bị của tôi
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Quản lý các thiết bị bạn đã đăng cho thuê trên nền tảng.
          </p>
        </div>
        
        <Link
          to="/dashboard/new-listing"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            borderRadius: 8,
            background: '#1a3fc7',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(26,63,199,0.25)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Đăng thiết bị mới
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Đang tải thiết bị...</div>
      ) : listings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#fff',
          borderRadius: 14,
          border: '2px dashed #e8ecf2',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#cbd5e1', display: 'block', marginBottom: 12 }}>
            photo_camera
          </span>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>
            Chưa có thiết bị nào
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
            Hãy đăng thiết bị đầu tiên để bắt đầu cho thuê và kiếm thu nhập.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {listings.map((lens) => (
            <div key={lens.id} style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e8ecf2',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ height: 180, position: 'relative', background: '#f1f5f9' }}>
                <img 
                  src={lens.images?.[0]?.image_url || lens.thumbnail || 'https://placehold.co/400x300/e2e8f0/64748b?text=Lens'} 
                  alt={lens.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 10, left: 10 }}>
                  {getStatusLabel(lens.approval_status)}
                </div>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ 
                  margin: '0 0 8px', 
                  fontSize: 16, 
                  fontWeight: 700, 
                  color: '#1e293b',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '44px',
                  lineHeight: '1.4'
                }}>
                  {lens.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, marginBottom: 16, minHeight: '20px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>location_on</span>
                  {lens.district || 'TP.HCM'}, {lens.city || ''}
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderTop: '1px solid #f1f5f9', 
                  paddingTop: 16,
                  marginTop: 'auto'
                }}>
                  <div style={{ fontWeight: 800, color: '#1a3fc7', fontSize: 15 }}>
                    {formatPrice(lens.price_per_day)}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ 
                      padding: '8px 16px', 
                      borderRadius: 8, 
                      border: '1px solid #e2e8f0', 
                      background: '#fff', 
                      cursor: 'pointer', 
                      fontSize: 12, 
                      fontWeight: 700,
                      transition: 'all 0.2s'
                    }}>Sửa</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
