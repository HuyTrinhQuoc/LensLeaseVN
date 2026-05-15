import { BadRequestException } from '@nestjs/common';

/** Múi giờ kinh doanh Việt Nam (ICT, UTC+7). */
export const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh' as const;

/** YYYY-MM-DD theo lịch Việt Nam tại instant `d`. */
export function toYmdInVietnam(d: Date): string {
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: VIETNAM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Parse 'YYYY-MM-DD' → UTC nửa đêm theo đúng chữ số ngày (không phụ thuộc TZ máy chủ).
 * Khớp cách frontend `parseDateOnlyLocal`.
 */
export function parseDateOnlyLocal(s: string): Date {
  const raw = s.trim().split('T')[0];
  const parts = raw.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    throw new BadRequestException('Định dạng ngày không hợp lệ (YYYY-MM-DD)');
  }
  const [y, m, d] = parts;
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Chuỗi YYYY-MM-DD theo lịch Việt Nam — dùng khi so khớp Prisma Date với ngày lịch,
 * tránh lệch khi máy chủ không ở ICT.
 */
export function toDateOnlyString(d: Date): string {
  return toYmdInVietnam(d);
}

/**
 * So sánh ngày theo lịch bằng chuỗi YYYY-MM-DD (thứ tự từ điển = thứ tự thời gian).
 * Dùng khi ghép Prisma Date với ngày từ vòng lặp lịch — tránh lệch do UTC vs local.
 */
export function isYmdBetweenInclusive(dayYmd: string, startYmd: string, endYmd: string): boolean {
  return dayYmd >= startYmd && dayYmd <= endYmd;
}
