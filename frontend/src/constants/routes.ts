/**
 * Tập trung quản lý đường dẫn route.
 * Import hằng số này thay vì hard-code chuỗi URL.
 */
export const ROUTES = {
  HOME: '/',
  CART: '/cart',
  CHECKOUT: '/checkout',
  WALLET: '/wallet',
  LOGIN: '/login',
  LENS_DETAIL: '/lens/:id',
} as const;
