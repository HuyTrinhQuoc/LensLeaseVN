import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { cartService } from '../../services/cart.service';
import api from '../../services/api';
import { API_BASE_URL } from '../../config/api-base';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromCart = Boolean((location.state as { cartReturn?: boolean } | null)?.cartReturn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // States quản lý UI
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      
      const token = res.data.accessToken;
      // Lưu token vào localStorage
      localStorage.setItem('token', token);
      
      // Gộp giỏ hàng (Merge Cart)
      try {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (localCart.length > 0) {
          // Pass token implicitly via api interceptor or just assume it is set by Auth service.
          // Since we just set token in localStorage, api interceptor should pick it up.
          // Wait, api interceptor reads from getAuthToken() which reads from localStorage.
          // So we can just call cartService.mergeCart
          await cartService.mergeCart(localCart);
          // Xóa giỏ hàng local sau khi đã gộp thành công
          localStorage.removeItem('cart');
        }
      } catch (mergeError) {
        console.error('Lỗi khi merge giỏ hàng:', mergeError);
      }

      // Đăng nhập thành công
      navigate(fromCart ? '/cart' : '/');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Sai thông tin đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-surface-container-low font-body">
      
      <div 
        className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-xl" 
        style={{ boxShadow: '0 40px 60px -15px rgba(0, 64, 161, 0.05)' }}
      >
        
        {/* ================= CỘT TRÁI (HÌNH ẢNH) ================= */}
        <div className="hidden md:block relative h-full min-h-[600px] bg-surface-container overflow-hidden">
          <img 
            alt="Professional camera lens close-up" 
            className="absolute inset-0 w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRexsxhnIwRGMdMjysvnDdWP4ci5biz3KCwEnSdqsC1SdVg11Mgx5Qir9mNTA6upMesUqFMPj27N0nVfWG9MGktHNEfp1hFX70a9Q5U719VTk17ym4gc0AGZnQpIpl78L1ZUT__dPdr_uKlrGMkaAHStEuLa-kEHftFOceDqJHxUV3qn3j7EHk8RqQcFuCd2e3V3cz8c-lUBdIEb-LO8XV8dTRjvoP8vbfmyHdd_rR6nmi2rOwrOwtfBrvppSkCICVNirrj2pKAx4" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-12 text-white">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">The Technical Curator.</h2>
            <p className="text-white/80 text-lg">Precision in every frame. Connect with the finest gear in Vietnam.</p>
          </div>
        </div>

        {/* ================= CỘT PHẢI (FORM ĐĂNG NHẬP) ================= */}
        <div className="flex flex-col justify-center px-8 py-12 md:px-16 lg:px-24 w-full">
          
          <div className="mb-10">
            <div className="text-3xl font-black tracking-tighter text-on-surface mb-6">LensLease VN</div>
            <h1 className="text-4xl font-bold text-on-surface tracking-tight mb-2">Chào mừng quay trở lại</h1>
            <p className="text-on-surface-variant text-base">Đăng nhập để tiếp tục quản lý thiết bị của bạn.</p>
          </div>

          {/* Hiển thị lỗi */}
          {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{errorMsg}</div>}

          <form onSubmit={handleLogin} className="flex flex-col w-full">
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-on-surface-variant mb-2" htmlFor="email">Email</label>
              <input 
                className="input-glass w-full px-4 py-3 text-base text-on-surface rounded-t-lg bg-surface-container-high border-b-2 border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all" 
                id="email" name="email" placeholder="Nhập địa chỉ email của bạn" required type="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-on-surface-variant" htmlFor="password">Mật khẩu</label>
                <a className="text-sm font-medium text-primary hover:text-primary-container transition-colors" href="#">Quên mật khẩu?</a>
              </div>
              <input 
                className="input-glass w-full px-4 py-3 text-base text-on-surface rounded-t-lg bg-surface-container-high border-b-2 border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all" 
                id="password" name="password" placeholder="Nhập mật khẩu" required type="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              className={`w-full text-white font-bold py-4 px-6 rounded-lg transition-opacity flex justify-center items-center shadow-lg shadow-primary/20 mb-8 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:opacity-90'}`} 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>

            {/* ================= ĐĂNG NHẬP MẠNG XÃ HỘI ================= */}
            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-[#c3c6d6]"></div>
              <span className="mx-4 text-sm text-on-surface-variant">Hoặc đăng nhập bằng</span>
              <div className="flex-grow border-t border-[#c3c6d6]"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-[#c3c6d6] rounded-md hover:bg-surface-container-low transition-colors text-on-surface text-sm font-medium" 
                type="button"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Google
              </button>
              <button 
                className="flex items-center justify-center gap-2 px-4 py-3 border border-[#c3c6d6] rounded-md hover:bg-surface-container-low transition-colors text-on-surface text-sm font-medium" 
                type="button"
              >
                <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
                Facebook
              </button>
            </div>
          </form>

          {/* ================= FOOTER ================= */}
          <div className="mt-10 pt-6 text-center border-t border-[#c3c6d6]">
            <p className="text-on-surface-variant text-sm">
              Chưa có tài khoản? 
              <Link to="/register" className="font-semibold text-primary hover:text-primary-container ml-1 transition-colors">Đăng ký ngay</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Auth;