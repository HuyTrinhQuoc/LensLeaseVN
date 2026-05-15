import { BadRequestException } from '@nestjs/common';
import {
  parseDateOnlyLocal,
  toDateOnlyString,
  isYmdBetweenInclusive,
} from './date-only.util';

describe('date-only.util', () => {
  describe('parseDateOnlyLocal', () => {
    it('parse YYYY-MM-DD thành Date UTC neo đúng lịch', () => {
      const d = parseDateOnlyLocal('2026-06-15');
      expect(d.getUTCFullYear()).toBe(2026);
      expect(d.getUTCMonth()).toBe(5);
      expect(d.getUTCDate()).toBe(15);
    });

    it('từ chối định dạng sai', () => {
      expect(() => parseDateOnlyLocal('not-a-date')).toThrow(BadRequestException);
      expect(() => parseDateOnlyLocal('2026-xx-01')).toThrow(BadRequestException);
      expect(() => parseDateOnlyLocal('')).toThrow(BadRequestException);
    });
  });

  describe('toDateOnlyString', () => {
    it('trả về YYYY-MM-DD theo lịch Việt Nam', () => {
      const noonUtc = new Date('2026-03-09T12:00:00.000Z');
      expect(toDateOnlyString(noonUtc)).toBe('2026-03-09');
      const nextDayVn = new Date('2026-03-09T17:00:00.000Z'); // 2026-03-10 00:00 ICT
      expect(toDateOnlyString(nextDayVn)).toBe('2026-03-10');
    });

    it('roundtrip với parseDateOnlyLocal', () => {
      expect(toDateOnlyString(parseDateOnlyLocal('2026-06-15'))).toBe('2026-06-15');
    });
  });

  describe('isYmdBetweenInclusive', () => {
    it('biên inclusive', () => {
      expect(isYmdBetweenInclusive('2026-01-10', '2026-01-10', '2026-01-12')).toBe(true);
      expect(isYmdBetweenInclusive('2026-01-12', '2026-01-10', '2026-01-12')).toBe(true);
      expect(isYmdBetweenInclusive('2026-01-09', '2026-01-10', '2026-01-12')).toBe(false);
      expect(isYmdBetweenInclusive('2026-01-13', '2026-01-10', '2026-01-12')).toBe(false);
    });

    it('so sánh chuỗi từ điển cho cùng tháng', () => {
      expect(isYmdBetweenInclusive('2026-01-02', '2026-01-01', '2026-01-31')).toBe(true);
    });
  });
});
