import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });

  // States quản lý UI
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Kiểm tra mật khẩu khớp nhau
    if (formData.password !== formData.confirm_password) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API Backend
      const res = await axios.post('http://localhost:3000/auth/register', formData);
      setSuccessMsg('Đăng ký thành công! Vui lòng kiểm tra email của bạn.');
      
      // Chờ 2 giây để user đọc thông báo rồi tự chuyển sang trang Login
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-surface-container-low font-body text-on-surface">
      <div 
        className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-xl"
        style={{ boxShadow: '0 40px 60px -15px rgba(0, 64, 161, 0.05)' }}
      >
        {/* ================= CỘT TRÁI (HÌNH ẢNH) ================= */}
        <div className="hidden md:block relative h-full min-h-[600px] bg-on-surface">
          <img 
            alt="High end professional camera lens detail" 
            className="absolute inset-0 w-full h-full object-cover opacity-80" 
            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-between p-12 lg:p-20">
            <div>
              <a className="inline-block" href="/">
                <h2 className="font-bold text-2xl tracking-tighter text-white">LensLease VN</h2>
              </a>
            </div>
            <div>
              <h1 className="font-extrabold text-4xl lg:text-5xl text-white mb-6 tracking-tight leading-tight">
                The Technical Curator.
              </h1>
              <p className="text-lg text-white/80 font-light leading-relaxed">
                Khám phá thế giới qua những ống kính tốt nhất Việt Nam. Nền tảng chia sẻ thiết bị nhiếp ảnh chuyên nghiệp dành cho những nhà sáng tạo.
              </p>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI (FORM ĐĂNG KÝ) ================= */}
        <div className="flex flex-col justify-center px-8 py-12 md:px-16 lg:px-24 bg-surface-container-lowest relative">
          
          <div className="absolute top-8 right-8 md:hidden">
            <a className="font-bold text-xl tracking-tighter text-on-surface" href="/">LensLease VN</a>
          </div>

          <div className="mb-6">
            <div className="text-3xl font-black tracking-tighter text-on-surface mb-6 hidden md:block">
              LensLease VN
            </div>
            <h2 className="text-4xl font-bold text-on-surface tracking-tight mb-2">
              Tạo tài khoản mới
            </h2>
            <p className="text-on-surface-variant text-base">
              Bắt đầu hành trình nhiếp ảnh chuyên nghiệp của bạn.
            </p>
          </div>

          {/* Hiển thị lỗi hoặc thành công */}
          {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{errorMsg}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">{successMsg}</div>}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* HỌ VÀ TÊN */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2" htmlFor="fullname">Họ và tên</label>
              <input 
                className="input-glass w-full px-4 py-3 text-base text-on-surface rounded-t-lg bg-surface-container-high border-b-2 border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all" 
                id="fullname" name="fullname" placeholder="Nguyễn Văn A" type="text" required
                value={formData.fullname} onChange={handleChange}
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2" htmlFor="email">Email</label>
              <input 
                className="input-glass w-full px-4 py-3 text-base text-on-surface rounded-t-lg bg-surface-container-high border-b-2 border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all" 
                id="email" name="email" placeholder="email@example.com" type="email" required
                value={formData.email} onChange={handleChange}
              />
            </div>

            {/* SỐ ĐIỆN THOẠI */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2" htmlFor="phone">Số điện thoại</label>
              <input 
                className="input-glass w-full px-4 py-3 text-base text-on-surface rounded-t-lg bg-surface-container-high border-b-2 border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all" 
                id="phone" name="phone" placeholder="0912 345 678" type="tel" required
                value={formData.phone} onChange={handleChange}
              />
            </div>

            {/* MẬT KHẨU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2" htmlFor="password">Mật khẩu</label>
                <input 
                  className="input-glass w-full px-4 py-3 text-base text-on-surface rounded-t-lg bg-surface-container-high border-b-2 border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all" 
                  id="password" name="password" placeholder="••••••••" type="password" required
                  value={formData.password} onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2" htmlFor="confirm_password">Xác nhận mật khẩu</label>
                <input 
                  className="input-glass w-full px-4 py-3 text-base text-on-surface rounded-t-lg bg-surface-container-high border-b-2 border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all" 
                  id="confirm_password" name="confirm_password" placeholder="••••••••" type="password" required
                  value={formData.confirm_password} onChange={handleChange}
                />
              </div>
            </div>

            {/* NÚT ĐĂNG KÝ */}
            <button 
              className={`w-full text-white font-bold py-4 px-6 rounded-lg transition-opacity flex justify-center items-center mt-4 shadow-lg shadow-primary/20 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:opacity-90'}`} 
              type="submit"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Đang xử lý...' : 'Đăng ký ngay'}</span>
            </button>
          </form>

        

 

          {/* ================= FOOTER ================= */}
          <div className="mt-8 pt-8 text-center border-t border-[#c3c6d6]/30">
            <p className="text-sm text-on-surface-variant">
              Đã có tài khoản? 
              <Link className="font-semibold text-primary hover:text-primary-container transition-colors ml-1" to="/login">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;