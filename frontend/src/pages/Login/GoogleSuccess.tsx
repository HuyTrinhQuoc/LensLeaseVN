import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Hàm hỗ trợ giải mã JWT (không cần thư viện ngoài)
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
    
    if (token) {
      localStorage.setItem('token', token);
      
      // Giải mã token để lấy thông tin role
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

  return <p>Đang xử lý đăng nhập...</p>;
};

export default LoginSuccess;