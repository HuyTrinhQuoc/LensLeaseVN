import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import type { Prisma } from '@prisma/client';
import { parseDateOnlyLocal, toDateOnlyString, isYmdBetweenInclusive } from '../../common/date-only.util';

type Db = Prisma.TransactionClient | PrismaService;

@Injectable()
export class LensAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mỗi ngày trong [start, end]: cộng booking overlap + blocked_quantity, lấy max.
   */
  computeMaxBookedForDayRange(
    overlappingBookings: Array<{
      start_date: Date;
      end_date: Date;
      items: { lens_id: string; quantity: number }[];
    }>,
    blockedDates: Array<{
      start_date: Date;
      end_date: Date;
      blocked_quantity: number;
    }>,
    start: Date,
    end: Date,
    lensId: string,
  ): number {
    let maxBooked = 0;
    const cur = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
    );
    const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

    while (cur <= endDay) {
      const dayStr = toDateOnlyString(cur);
      let dayBooked = 0;
      for (const b of overlappingBookings) {
        const bStart = toDateOnlyString(b.start_date);
        const bEnd = toDateOnlyString(b.end_date);
        if (isYmdBetweenInclusive(dayStr, bStart, bEnd)) {
          dayBooked += b.items
            .filter((i) => i.lens_id === lensId)
            .reduce((s, i) => s + i.quantity, 0);
        }
      }
      for (const bd of blockedDates) {
        const bdStart = toDateOnlyString(bd.start_date);
        const bdEnd = toDateOnlyString(bd.end_date);
        if (isYmdBetweenInclusive(dayStr, bdStart, bdEnd)) {
          dayBooked += bd.blocked_quantity;
        }
      }
      maxBooked = Math.max(maxBooked, dayBooked);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return maxBooked;
  }

  async fetchOverlapAndBlocked(
    db: Db,
    lensId: string,
    start: Date,
    end: Date,
    excludeBookingId?: string,
  ) {
    const whereBooking: Prisma.BookingWhereInput = {
      items: { some: { lens_id: lensId } },
      status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
      start_date: { lte: end },
      end_date: { gte: start },
    };
    if (excludeBookingId) {
      whereBooking.id = { not: excludeBookingId };
    }

    const [overlapping, blockedDates] = await Promise.all([
      db.booking.findMany({
        where: whereBooking,
        include: { items: { where: { lens_id: lensId } } },
      }),
      db.blockedDate.findMany({
        where: {
          lens_id: lensId,
          start_date: { lte: end },
          end_date: { gte: start },
        },
      }),
    ]);
    return { overlapping, blockedDates };
  }

  async assertLensAvailable(
    db: Db,
    lensId: string,
    start: Date,
    end: Date,
    quantity: number,
    excludeBookingId?: string,
  ) {
    const lens = await db.lensListing.findUnique({ where: { id: lensId } });
    if (!lens) throw new NotFoundException('Sản phẩm không tồn tại');

    const { overlapping, blockedDates } = await this.fetchOverlapAndBlocked(
      db,
      lensId,
      start,
      end,
      excludeBookingId,
    );

    const maxBooked = this.computeMaxBookedForDayRange(
      overlapping,
      blockedDates,
      start,
      end,
      lensId,
    );

    if (maxBooked + quantity > lens.quantity) {
      throw new ConflictException(
        'Sản phẩm đã hết chỗ cho khoảng ngày đã chọn. Vui lòng chọn ngày khác.',
      );
    }
  }

  /** Dùng cho GET check-availability (đã parse chuỗi YYYY-MM-DD). */
  async getAvailabilityPayload(
    lensId: string,
    startDateStr: string,
    endDateStr: string,
    quantity: number,
    calculateRentalDays: (a: Date, b: Date) => number,
  ) {
    const lens = await this.prisma.lensListing.findUnique({
      where: { id: lensId },
    });
    if (!lens) throw new NotFoundException('Sản phẩm không tồn tại');

    const start = parseDateOnlyLocal(startDateStr);
    const end = parseDateOnlyLocal(endDateStr);

    const { overlapping, blockedDates } = await this.fetchOverlapAndBlocked(
      this.prisma,
      lensId,
      start,
      end,
    );

    const maxBooked = this.computeMaxBookedForDayRange(
      overlapping,
      blockedDates,
      start,
      end,
      lensId,
    );

    const availableQty = Math.max(0, lens.quantity - maxBooked);
    const isAvailable = availableQty >= quantity;
    const rentalDays = calculateRentalDays(start, end);

    return {
      lens_id: lensId,
      start_date: startDateStr,
      end_date: endDateStr,
      requested_quantity: quantity,
      available_quantity: availableQty,
      is_available: isAvailable,
      price_per_day: lens.price_per_day,
      rental_days: rentalDays,
      estimated_total:
        Number(lens.price_per_day) * rentalDays * quantity,
      deposit_amount: lens.required_deposit_amount
        ? Number(lens.required_deposit_amount)
        : null,
    };
  }
}
