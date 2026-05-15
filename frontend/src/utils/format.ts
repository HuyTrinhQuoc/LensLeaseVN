import { VIETNAM_TIME_ZONE } from './date-only';

/**
 * Format số tiền sang định dạng tiền tệ Việt Nam.
 * Ví dụ: 1500000 → "1.500.000đ"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

/**
 * Format ngày tháng sang định dạng dd/MM/yyyy (theo lịch Việt Nam nếu là ISO có giờ).
 */
export function formatDate(dateStr: string): string {
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim());
  if (ymd) return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format ngày giờ đầy đủ theo giờ Việt Nam.
 */
export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIME_ZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Rút gọn chuỗi dài.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}
