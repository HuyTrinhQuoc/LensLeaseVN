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

      {/* Nút Cuộn Lên Đầu Trang */}
      <button 
        onClick={scrollToTop} 
        style={{
          position: 'fixed',
          bottom: '40px',
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
    </div>
  );
}
