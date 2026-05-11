import { useEffect } from 'react';


const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Lưu token vào localStorage
      localStorage.setItem('token', token);
      // Chuyển hướng về trang chủ
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return <p>Đang xử lý đăng nhập...</p>;
};

export default LoginSuccess;