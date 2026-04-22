import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div style={{ padding: '60px 20px', minHeight: '60vh', textAlign: 'center', backgroundColor: '#f3f4f6' }}>
      <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
        Chào mừng đến với LensLease VN
      </h1>
      <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '32px' }}>
        Nền tảng kết nối cho thuê thiết bị quay phim, máy ảnh uy tín và an toàn nhất Việt Nam.
      </p>
      
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <Link 
          to="/products" 
          style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}
        >
          Khám phá thiết bị
        </Link>
        <Link 
          to="/cart" 
          style={{ padding: '12px 24px', backgroundColor: '#fff', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}
        >
          Xem giỏ hàng
        </Link>
      </div>
    </div>
  );
}
