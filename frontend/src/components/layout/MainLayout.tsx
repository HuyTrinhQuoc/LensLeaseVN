import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) {
        setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 400) {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', position: 'relative' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: '#f4f7fe' }}>
        {children || <Outlet />}
      </main>
      <Footer />

      {/* Nút Chuông Thông Báo (Góc Trái) */}
      <button 
        style={{
          position: 'fixed',
          bottom: '40px',
          left: '40px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#2563eb', // Messenger-like blue
          color: '#fff',
          border: 'none',
          boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Thông báo"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>notifications</span>
        {/* Chấm đỏ thông báo */}
        <span style={{
          position: 'absolute',
          top: '12px',
          right: '14px',
          width: '10px',
          height: '10px',
          backgroundColor: '#ef4444',
          borderRadius: '50%',
          border: '2px solid #2563eb'
        }}></span>
      </button>

      {/* Nút Cuộn Lên Đầu Trang */}
      <button 
        onClick={scrollToTop} 
        style={{
          position: 'fixed',
          bottom: '120px', // Đẩy lên một chút để nhường chỗ cho Messenger (nếu có)
          right: '40px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#016de0',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: showScroll ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'opacity 0.3s'
        }}
        title="Lên đầu trang"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_upward</span>
      </button>

      {/* Nút Chat (Messenger Dummy) - Thay cho ScrollToTop cũ ở sát góc phải dưới */}
      <button 
        style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#0084ff', // Chuẩn màu Messenger
          color: '#fff',
          border: 'none',
          boxShadow: '0 6px 16px rgba(0, 132, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Chat với chúng tôi"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>chat</span>
      </button>
    </div>
  );
}
