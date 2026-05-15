/** Múi giờ kinh doanh (lãnh thổ Việt Nam, UTC+7, không DST). */
export const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh' as const;

/** YYYY-MM-DD theo lịch Việt Nam tại instant `d` (đọc API timestamp / “hôm nay”). */
export function toYmdInVietnam(d: Date): string {
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: VIETNAM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/** Ngày hiện tại theo lịch Việt Nam — mặc định date picker / tối thiểu thuê. */
export function todayVietnamYmd(): string {
  return toYmdInVietnam(new Date());
}

/**
 * YYYY-MM-DD từ Date neo UTC (sau `parseDateOnlyLocal` / cộng ngày bằng `setUTCDate`).
 * Không phụ thuộc múi giờ trình duyệt.
 */
export function toDateOnlyStringLocal(d: Date): string {
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD → UTC nửa đêm theo đúng chữ số ngày dương lịch. */
export function parseDateOnlyLocal(s: string): Date {
  const raw = s.split('T')[0];
  const parts = raw.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return new Date(NaN);
  }
  const [y, mo, d] = parts;
  return new Date(Date.UTC(y, mo - 1, d));
}

/**
 * Lấy YYYY-MM-DD từ field ngày API/Prisma.
 * Chuỗi thuần `YYYY-MM-DD` giữ nguyên; có giờ/múi → quy về lịch Việt Nam.
 */
export function ymdFromApiDateField(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value === 'string') {
    const t = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    const d = new Date(t);
    if (!Number.isNaN(d.getTime())) return toYmdInVietnam(d);
    const m = /^(\d{4}-\d{2}-\d{2})/.exec(t);
    return m ? m[1] : '';
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toYmdInVietnam(value);
  }
  return ymdFromApiDateField(String(value));
}

/**
 * Số ngày tính tiền thuê: `ceil((end − start) / 1 ngày)` trên mốc UTC neo,
 * tối thiểu 1 — cùng tinh thần với backend cart/booking.
 */
export function calculateRentalDaysLocal(startYmd: string, endYmd: string): number {
  const start = parseDateOnlyLocal(startYmd.split('T')[0]);
  const end = parseDateOnlyLocal(endYmd.split('T')[0]);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 1;
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/** Cộng `days` vào một YMD (neo UTC). */
export function addDaysUtcYmd(yyyyMmDd: string, days: number): string {
  const d = parseDateOnlyLocal(yyyyMmDd.split('T')[0]);
  if (Number.isNaN(d.getTime())) return todayVietnamYmd();
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return toDateOnlyStringLocal(x);
}

/** Liệt kê YYYY-MM-DD từ start đến end (inclusive), neo UTC. */
export function enumerateInclusiveUtcYmds(startYmd: string, endYmd: string): string[] {
  const out: string[] = [];
  const a = parseDateOnlyLocal(startYmd.split('T')[0]);
  const b = parseDateOnlyLocal(endYmd.split('T')[0]);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || a > b) return out;
  const cur = new Date(a);
  while (cur <= b) {
    out.push(toDateOnlyStringLocal(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

/** Tháng `YYYY-MM` từ một chuỗi ngày (neo UTC). */
export function calendarMonthFromYmd(yyyyMmDd: string): string {
  const d = parseDateOnlyLocal(yyyyMmDd.split('T')[0]);
  if (Number.isNaN(d.getTime())) return todayVietnamYmd().slice(0, 7);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}
