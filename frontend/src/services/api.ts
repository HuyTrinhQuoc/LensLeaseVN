import axios from 'axios';

/**
 * Axios instance cấu hình sẵn cho API backend NestJS.
 * Base URL sẽ được cấu hình qua biến môi trường VITE_API_BASE_URL.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: thêm token xác thực ──
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      try {
        if (token.split('.').length === 3) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.userId || payload.sub;
          if (userId) {
            config.headers['x-user-id'] = userId;
          }
        } else {
          config.headers['x-user-id'] = token;
        }
      } catch (e) {}
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: xử lý lỗi chung ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Có thể redirect đến trang login ở đây
      console.warn('Phiên đăng nhập đã hết hạn');
    }
    return Promise.reject(error);
  },
);

export default api;
