import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Hàm hỗ trợ giải mã JWT
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    // Lấy thêm các thông tin user từ URL
    const email = searchParams.get('email');
    const fullName = searchParams.get('fullName');
    const picture = searchParams.get('picture');
    
    if (token) {
      // 1. Lưu token
      localStorage.setItem('token', token);
      
      // 2. Lưu thông tin User (để sau này hiển thị Avatar, Tên ở Header)
      const userInfo = {
        email: email || '',
        fullName: fullName || '',
        picture: picture || ''
      };
      localStorage.setItem('user_profile', JSON.stringify(userInfo));
      
      // 3. Giải mã token để lấy thông tin role điều hướng
      const decodedToken = parseJwt(token);
      
      if (decodedToken?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-surface-container-lowest">
       <p className="text-lg font-medium text-on-surface-variant">Đang xử lý đăng nhập...</p>
    </div>
  );
};

export default LoginSuccess;