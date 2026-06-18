import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateBookingDto, ExtendBookingDto, CheckoutGroupDto } from './dto';
import { LensAvailabilityService } from '../lens-availability/lens-availability.service';
import { WalletLedgerService } from '../wallet/wallet-ledger.service';
import { PromotionsService } from '../promotions/promotions.service';
import { EkycService } from '../ekyc/ekyc.service';
import {
  parseDateOnlyLocal,
  toDateOnlyString,
  isYmdBetweenInclusive,
} from '../../common/date-only.util';

/** Tỉ lệ phí sàn: 8% */
const PLATFORM_FEE_RATE = 0.08;

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private readonly lensAvailability: LensAvailabilityService,
    private readonly walletLedger: WalletLedgerService,
    private readonly promotionsService: PromotionsService,
    private readonly ekycService: EkycService,
  ) {}

  // ═══════════════════════════════════════════
  //  TÍNH NĂNG 1: LỊCH TRÌNH & ĐẶT CHỖ
  // ═══════════════════════════════════════════

  /**
   * Lấy lịch khả dụng cho 1 sản phẩm theo tháng.
   * Trả về mỗi ngày: trạng thái, số lượng đã đặt, còn trống.
   */
  async getCalendar(lensId: string, month: string) {
    const lens = await this.prisma.lensListing.findUnique({
      where: { id: lensId },
    });
    if (!lens) throw new NotFoundException('Sản phẩm không tồn tại');

    // Parse tháng → đầu tháng / cuối tháng
    const [year, mon] = month.split('-').map(Number);
    const startOfMonth = new Date(Date.UTC(year, mon - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, mon, 0)); // Ngày cuối tháng (UTC neo)

    // Lấy tất cả bookings overlap với tháng này
    const bookings = await this.prisma.booking.findMany({
      where: {
        items: { some: { lens_id: lensId } },
        status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
        start_date: { lte: endOfMonth },
        end_date: { gte: startOfMonth },
      },
      include: { items: { where: { lens_id: lensId } } },
    });

    // Lấy blocked dates
    const blockedDates = await this.prisma.blockedDate.findMany({
      where: {
        lens_id: lensId,
        start_date: { lte: endOfMonth },
        end_date: { gte: startOfMonth },
      },
    });

    // Tạo calendar cho từng ngày
    const days: Array<Record<string, any>> = [];
    const currentDate = new Date(startOfMonth);

    while (currentDate <= endOfMonth) {
      const dateStr = toDateOnlyString(currentDate);

      // Đếm booking overlap ngày này
      let bookedQty = 0;
      const bookingStatuses: { status: string; qty: number }[] = [];

      for (const booking of bookings) {
        const bStart = toDateOnlyString(booking.start_date);
        const bEnd = toDateOnlyString(booking.end_date);
        if (isYmdBetweenInclusive(dateStr, bStart, bEnd)) {
          const qty = booking.items.reduce((sum, i) => sum + i.quantity, 0);
          bookedQty += qty;
          bookingStatuses.push({ status: booking.status, qty });
        }
      }

      // Kiểm tra blocked
      let isBlocked = false;
      let blockedReason: string | null = null;
      let blockedQty = 0;

      for (const bd of blockedDates) {
        const bdStart = toDateOnlyString(bd.start_date);
        const bdEnd = toDateOnlyString(bd.end_date);
        if (isYmdBetweenInclusive(dateStr, bdStart, bdEnd)) {
          isBlocked = true;
          blockedReason = bd.reason;
          blockedQty += bd.blocked_quantity;
        }
      }

      const totalUnavailable = bookedQty + blockedQty;
      const availableQty = Math.max(0, lens.quantity - totalUnavailable);

      let status: string;
      if (isBlocked && blockedQty >= lens.quantity) {
        status = 'BLOCKED';
      } else if (availableQty === 0) {
        status = 'FULLY_BOOKED';
      } else if (totalUnavailable > 0) {
        status = 'PARTIAL';
      } else {
        status = 'AVAILABLE';
      }

      days.push({
        date: dateStr,
        status,
        total_quantity: lens.quantity,
        available_qty: availableQty,
        booked_qty: bookedQty,
        blocked_qty: blockedQty,
        ...(isBlocked && { blocked_reason: blockedReason }),
        ...(bookingStatuses.length > 0 && {
          bookings_preview: bookingStatuses,
        }),
      });

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return {
      lens_id: lensId,
      month,
      total_quantity: lens.quantity,
      days,
    };
  }

  /**
   * Kiểm tra khả dụng cho khoảng ngày cụ thể.
   */
  async checkAvailability(
    lensId: string,
    startDate: string,
    endDate: string,
    quantity: number,
  ) {
    return this.lensAvailability.getAvailabilityPayload(
      lensId,
      startDate,
      endDate,
      quantity,
      (a, b) => this.calculateRentalDays(a, b),
    );
  }

  async renterReturnDevice(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Không tìm thấy đơn hàng');

    if (booking.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Trạng thái đơn hàng không hợp lệ để trả máy',
      );
    }

    return this.prisma.booking.update({
      where: { id },
      data: { renter_returned: true },
    });
  }

  // ═══════════════════════════════════════════
  //  TÍNH NĂNG 2: BOOKING CRUD
  // ═══════════════════════════════════════════

  /**
   * Tạo yêu cầu thuê (Bước 1: Người thuê gửi YÊU CẦU).
   * Status = PENDING, chờ Owner duyệt.
   */

  // ═══════════════════════════════════════════
  //  LẤY CHI TIẾT 1 ĐƠN ĐẶT THUÊ THEO ID
  // ═══════════════════════════════════════════
  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: true, 
        owner: true, 
        handoverReport: true, 
        items: {
          include: {
            lens: {
              include: {
                specs: true, 
                images: true, 
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt thuê với ID: ${id}`);
    }

    return booking;
  }

  async createBooking(userId: string, dto: CreateBookingDto) {
    const lens = await this.prisma.lensListing.findUnique({
      where: { id: dto.lens_id },
    });
    if (!lens) throw new NotFoundException('Sản phẩm không tồn tại');
    if (
      !lens.available ||
      lens.is_deleted ||
      lens.approval_status !== 'APPROVED'
    ) {
      throw new BadRequestException('Sản phẩm không khả dụng');
    }
    if (lens.owner_id === userId) {
      throw new BadRequestException(
        'Bạn không thể thuê thiết bị của chính mình',
      );
    }

    await this.ekycService.assertUserKycApproved(userId);

    const startDate = parseDateOnlyLocal(dto.start_date);
    const endDate = parseDateOnlyLocal(dto.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today)
      throw new BadRequestException('Ngày bắt đầu không thể trong quá khứ');
    if (endDate <= startDate)
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');

    // Kiểm tra khả dụng (booking + blocked dates), parse ngày local
    const booking = await this.prisma.$transaction(async (tx) => {
      const quantity =
        dto.quantity != null && dto.quantity > 0 ? dto.quantity : 1;

      await this.lensAvailability.assertLensAvailable(
        tx,
        dto.lens_id,
        startDate,
        endDate,
        quantity,
      );

      const allowed = lens.allowed_deposit_types ?? [];
      if (!allowed.includes(dto.selected_deposit_type)) {
        throw new BadRequestException(
          'Hình thức cọc không được hỗ trợ cho thiết bị này',
        );
      }

      // Tính tiền
      const rentalDays = this.calculateRentalDays(startDate, endDate);
      const pricePerDay = Number(lens.price_per_day);
      const subTotal = pricePerDay * rentalDays * quantity;
      const platformFee = Math.round(subTotal * PLATFORM_FEE_RATE * 100) / 100;
      const totalPrice = subTotal + platformFee;
      const depositAmount = lens.required_deposit_amount
        ? Number(lens.required_deposit_amount)
        : subTotal; // Mặc định cọc = giá thuê nếu owner chưa set

      // Tạo booking
      const newBooking = await tx.booking.create({
        data: {
          user_id: userId,
          owner_id: lens.owner_id,
          start_date: startDate,
          end_date: endDate,
          sub_total: subTotal,
          total_price: totalPrice,
          platform_fee_amount: platformFee,
          status: 'PENDING',
          delivery_method: dto.delivery_method || 'SELF_PICKUP',
          delivery_address: dto.delivery_address,
          selected_deposit_type: dto.selected_deposit_type,
          deposit_amount: depositAmount,
          deposit_note: dto.deposit_note,
          items: {
            create: {
              lens_id: dto.lens_id,
              quantity,
              price_per_day: pricePerDay,
            },
          },
        },
        include: {
          items: { include: { lens: { include: { images: true } } } },
          owner: { select: { id: true, full_name: true, phone: true } },
          user: { select: { id: true, full_name: true, phone: true } },
        },
      });

      return newBooking;
    });

    return booking;
  }

  /**
   * Checkout nhiều món: một BookingGroup + nhiều Booking con (cùng transaction).
   * Tiền ví vẫn trừ khi owner CONFIRM từng đơn (giữ nguyên nghiệp vụ hiện tại).
   */
  async checkoutGroup(userId: string, dto: CheckoutGroupDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Danh sách đặt thuê không được để trống');
    }

    await this.ekycService.assertUserKycApproved(userId);

    return this.prisma.$transaction(async (tx) => {
      type Line = {
        lens: {
          id: string;
          owner_id: string;
          price_per_day: unknown;
          required_deposit_amount: unknown | null;
        };
        startDate: Date;
        endDate: Date;
        subTotal: number;
        platformFee: number;
        totalPrice: number;
        depositAmount: number;
        item: CreateBookingDto;
      };

      const lines: Line[] = [];

      for (const item of dto.items) {
        const lens = await tx.lensListing.findUnique({
          where: { id: item.lens_id },
        });
        if (!lens)
          throw new NotFoundException(`Sản phẩm ${item.lens_id} không tồn tại`);
        if (
          !lens.available ||
          lens.is_deleted ||
          lens.approval_status !== 'APPROVED'
        ) {
          throw new BadRequestException(
            'Một hoặc nhiều sản phẩm không khả dụng',
          );
        }
        if (lens.owner_id === userId) {
          throw new BadRequestException(
            'Bạn không thể thuê thiết bị của chính mình',
          );
        }

        const allowed = lens.allowed_deposit_types ?? [];
        if (!allowed.includes(item.selected_deposit_type)) {
          throw new BadRequestException(
            `Thiết bị "${lens.title}": hình thức cọc đã chọn không được hỗ trợ`,
          );
        }

        const startDate = parseDateOnlyLocal(item.start_date);
        const endDate = parseDateOnlyLocal(item.end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) {
          throw new BadRequestException('Ngày bắt đầu không thể trong quá khứ');
        }
        if (endDate <= startDate) {
          throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
        }

        const quantity =
          item.quantity != null && item.quantity > 0 ? item.quantity : 1;

        await this.lensAvailability.assertLensAvailable(
          tx,
          item.lens_id,
          startDate,
          endDate,
          quantity,
        );

        const rentalDays = this.calculateRentalDays(startDate, endDate);
        const pricePerDay = Number(lens.price_per_day);
        const subTotal = pricePerDay * rentalDays * quantity;
        const platformFee =
          Math.round(subTotal * PLATFORM_FEE_RATE * 100) / 100;
        const totalPrice = subTotal + platformFee;
        const depositAmount = lens.required_deposit_amount
          ? Number(lens.required_deposit_amount)
          : subTotal;

        lines.push({
          lens,
          startDate,
          endDate,
          subTotal,
          platformFee,
          totalPrice,
          depositAmount,
          item,
        });
      }

      const groupSubTotal = lines.reduce((s, l) => s + l.subTotal, 0);
      /** Tổng tiền khách phải có trên ví khi chủ duyệt: tiền thuê+phí + cọc nền tảng (nếu MONEY_PLATFORM). Khớp `chargeRenterOnConfirm`. */
      const groupPayableTotal = lines.reduce((s, l) => {
        const dep =
          l.item.selected_deposit_type === 'MONEY_PLATFORM' &&
          l.depositAmount > 0
            ? l.depositAmount
            : 0;
        return s + l.totalPrice + dep;
      }, 0);

      let discountAmount = 0;
      let promotionId: string | null = null;
      if (dto.promotion_code?.trim()) {
        const lensIds = lines.map((l) => l.lens.id);
        const promo = await this.promotionsService.resolveDiscount(
          dto.promotion_code,
          groupSubTotal,
          lensIds,
          tx,
        );
        discountAmount = promo.discount_amount;
        promotionId = promo.promotion_id;
      }

      const groupTotalAfterDiscount = Math.max(
        0,
        Math.round((groupPayableTotal - discountAmount) * 100) / 100,
      );

      const group = await tx.bookingGroup.create({
        data: {
          user_id: userId,
          sub_total: groupSubTotal,
          discount_amount: discountAmount,
          total_amount: groupTotalAfterDiscount,
          payment_method: 'CASH',
          status: 'PENDING',
          gateway_transaction_id: null,
          promotion_id: promotionId,
        },
      });

      if (promotionId) {
        await this.promotionsService.incrementUsage(promotionId, tx);
      }

      const bookings: Awaited<ReturnType<typeof tx.booking.create>>[] = [];
      let remainingDiscount = discountAmount;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const {
          lens,
          startDate,
          endDate,
          subTotal,
          platformFee,
          totalPrice,
          depositAmount,
          item,
        } = line;
        const pricePerDay = Number(lens.price_per_day);
        const quantity =
          item.quantity != null && item.quantity > 0 ? item.quantity : 1;

        let lineDiscount = 0;
        if (discountAmount > 0 && groupSubTotal > 0) {
          if (i === lines.length - 1) {
            lineDiscount = remainingDiscount;
          } else {
            lineDiscount =
              Math.round((subTotal / groupSubTotal) * discountAmount * 100) /
              100;
            remainingDiscount -= lineDiscount;
          }
        }
        const adjustedTotalPrice = Math.max(0, totalPrice - lineDiscount);

        const nb = await tx.booking.create({
          data: {
            user_id: userId,
            owner_id: lens.owner_id,
            booking_group_id: group.id,
            start_date: startDate,
            end_date: endDate,
            sub_total: subTotal,
            total_price: adjustedTotalPrice,
            platform_fee_amount: platformFee,
            discount_amount: lineDiscount,
            promotion_id: promotionId,
            status: 'PENDING',
            delivery_method: item.delivery_method || 'SELF_PICKUP',
            delivery_address: item.delivery_address,
            selected_deposit_type: item.selected_deposit_type,
            deposit_amount: depositAmount,
            deposit_note: item.deposit_note,
            items: {
              create: {
                lens_id: item.lens_id,
                quantity,
                price_per_day: pricePerDay,
              },
            },
          },
          include: {
            items: { include: { lens: { include: { images: true } } } },
            owner: { select: { id: true, full_name: true, phone: true } },
            user: { select: { id: true, full_name: true, phone: true } },
          },
        });
        bookings.push(nb);

        await tx.bookingPayoutAllocation.create({
          data: {
            booking_id: nb.id,
            owner_id: nb.owner_id,
            gross_amount: Number(nb.sub_total),
            platform_fee: Number(nb.platform_fee_amount),
            net_amount: Number(nb.total_price) - Number(nb.platform_fee_amount),
            status: 'PENDING',
          },
        });
      }

      if (dto.cart_item_ids?.length) {
        await tx.cartItem.deleteMany({
          where: {
            id: { in: dto.cart_item_ids },
            cart: { user_id: userId },
          },
        });
      }

      return {
        booking_group_id: group.id,
        booking_group_status: group.status,
        total_amount: groupTotalAfterDiscount,
        discount_amount: discountAmount,
        bookings,
      };
    });
  }

  /**
   * Danh sách booking (lọc theo role + status + ngày + tìm kiếm).
   */
  async findAll(
    userId: string,
    role: 'renter' | 'owner',
    status?: string,
    page = 1,
    limit = 10,
    opts?: {
      from_date?: string;
      to_date?: string;
      date_field?: 'start' | 'end' | 'overlap';
      search?: string;
    },
  ) {
    const baseWhere = this.buildBookingListWhere(userId, role, {
      from_date: opts?.from_date,
      to_date: opts?.to_date,
      date_field: opts?.date_field,
      search: opts?.search,
    });

    const where = { ...baseWhere };
    if (status) {
      where.status = status.toUpperCase();
    }

    const skip = (page - 1) * limit;

    const bookingInclude = {
      items: { include: { lens: { include: { images: true } } } },
      booking_group: {
        select: {
          id: true,
          status: true,
          total_amount: true,
          payment_method: true,
        },
      },
      owner: {
        select: {
          id: true,
          full_name: true,
          phone: true,
          rating_avg: true,
        },
      },
      user: {
        select: {
          id: true,
          full_name: true,
          phone: true,
          rating_avg: true,
        },
      },
    } as const;

    const queries: [
      ReturnType<typeof this.prisma.booking.findMany>,
      ReturnType<typeof this.prisma.booking.count>,
      Promise<Record<string, number>> | Promise<null>,
    ] = [
      this.prisma.booking.findMany({
        where,
        orderBy: [
          { booking_group_id: { sort: 'desc', nulls: 'last' } },
          { created_at: 'desc' },
        ],
        skip,
        take: limit,
        include: bookingInclude,
      }),
      this.prisma.booking.count({ where }),
      role === 'owner'
        ? this.countBookingsByStatus(baseWhere)
        : Promise.resolve(null),
    ];

    const [bookings, total, status_counts] = await Promise.all(queries);

    return {
      data: bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      ...(status_counts ? { status_counts } : {}),
    };
  }

  private buildBookingListWhere(
    userId: string,
    role: 'renter' | 'owner',
    opts?: {
      from_date?: string;
      to_date?: string;
      date_field?: 'start' | 'end' | 'overlap';
      search?: string;
    },
  ) {
    const where: Record<string, unknown> =
      role === 'renter' ? { user_id: userId } : { owner_id: userId };

    const dateField = opts?.date_field ?? 'overlap';
    const from = opts?.from_date
      ? parseDateOnlyLocal(opts.from_date)
      : undefined;
    const to = opts?.to_date ? parseDateOnlyLocal(opts.to_date) : undefined;

    if (from || to) {
      if (dateField === 'start') {
        const clause: Record<string, Date> = {};
        if (from) clause.gte = from;
        if (to) clause.lte = to;
        where.start_date = clause;
      } else if (dateField === 'end') {
        const clause: Record<string, Date> = {};
        if (from) clause.gte = from;
        if (to) clause.lte = to;
        where.end_date = clause;
      } else {
        if (from) where.end_date = { gte: from };
        if (to) where.start_date = { lte: to };
      }
    }

    const q = opts?.search?.trim();
    if (q) {
      const and = (where.AND as unknown[]) ?? [];
      and.push({
        OR: [
          { id: { contains: q, mode: 'insensitive' } },
          { user: { full_name: { contains: q, mode: 'insensitive' } } },
          {
            items: {
              some: { lens: { title: { contains: q, mode: 'insensitive' } } },
            },
          },
        ],
      });
      where.AND = and;
    }

    return where;
  }

  private async countBookingsByStatus(
    baseWhere: Record<string, unknown>,
  ): Promise<Record<string, number>> {
    const rows = await this.prisma.booking.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: { _all: true },
    });
    const counts: Record<string, number> = { all: 0 };
    for (const row of rows) {
      counts[row.status] = row._count._all;
      counts.all += row._count._all;
    }
    return counts;
  }

  async getOwnerStats(
    ownerId: string,
    opts?: { month?: number; year?: number },
  ) {
    const now = new Date();
    const year = opts?.year ?? now.getFullYear();
    const month = opts?.month ?? now.getMonth() + 1;
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59, 999);

    const periodWhere = {
      owner_id: ownerId,
      status: 'COMPLETED' as const,
      updated_at: { gte: periodStart, lte: periodEnd },
    };

    const [
      totalOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      periodCompleted,
      owner,
    ] = await Promise.all([
      this.prisma.booking.count({ where: { owner_id: ownerId } }),
      this.prisma.booking.count({
        where: { owner_id: ownerId, status: 'ACTIVE' },
      }),
      this.prisma.booking.count({
        where: { owner_id: ownerId, status: 'COMPLETED' },
      }),
      this.prisma.booking.count({
        where: { owner_id: ownerId, status: 'CANCELLED' },
      }),
      this.prisma.booking.findMany({
        where: periodWhere,
        select: { total_price: true },
      }),
      this.prisma.user.findUnique({
        where: { id: ownerId },
        select: { rating_avg: true },
      }),
    ]);

    const periodRevenue = periodCompleted.reduce(
      (sum, b) => sum + Number(b.total_price),
      0,
    );
    const periodRentals = periodCompleted.length;

    const revenue_growth = await this.buildOwnerMonthlyRevenueChart(
      ownerId,
      year,
      month,
    );
    const top_lenses = await this.buildOwnerTopLensesFromCompleted(
      ownerId,
      periodStart,
      periodEnd,
    );
    const vacancy_rate = await this.computeOwnerVacancyRate(ownerId);

    const completedBookings = await this.prisma.booking.findMany({
      where: { owner_id: ownerId, status: 'COMPLETED' },
      select: { total_price: true },
    });
    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + Number(b.total_price),
      0,
    );

    return {
      period: { month, year, label: `Tháng ${month}, ${year}` },
      total_orders: totalOrders,
      active_orders: activeOrders,
      completed_orders: completedOrders,
      cancelled_orders: cancelledOrders,
      total_revenue: periodRevenue,
      successful_rentals: periodRentals,
      vacancy_rate,
      rating_avg: owner?.rating_avg ?? null,
      status_distribution: {
        completed: completedOrders,
        active: activeOrders,
        cancelled: cancelledOrders,
      },
      revenue_growth,
      top_lenses,
      all_time_revenue: totalRevenue,
      revenue_mom_pct: this.computeMomPercent(revenue_growth),
    };
  }

  /**
   * Chi tiết booking.
   */
  async findById(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        items: {
          include: { lens: { include: { images: true, specs: true } } },
        },
        owner: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            email: true,
            rating_avg: true,
          },
        },
        user: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            email: true,
            rating_avg: true,
          },
        },
        booking_group: true,
        disputes: true,
        reviews: true,
        transactions: true,
      },
    });

    if (!booking) throw new NotFoundException('Không tìm thấy đơn thuê');

    // Chỉ cho phép owner hoặc renter xem
    if (booking.user_id !== userId && booking.owner_id !== userId) {
      throw new BadRequestException('Bạn không có quyền xem đơn thuê này');
    }

    // Thêm thông tin tính toán
    const rentalDays = this.calculateRentalDays(
      booking.start_date,
      booking.end_date,
    );
    const lateFee = this.calculateLateFee(booking);

    return {
      ...booking,
      rental_days: rentalDays,
      late_fee: lateFee,
    };
  }

  // ═══════════════════════════════════════════
  //  QUY TRÌNH 7 BƯỚC (THEO GV)
  // ═══════════════════════════════════════════

  /**
   * Bước 2: Owner DUYỆT yêu cầu → CONFIRMED.
   * Trừ tiền thuê + ký quỹ (nếu MONEY_PLATFORM) từ ví người thuê; tiền cọc chuyển sang pending_balance.
   */
  async confirmBooking(bookingId: string, ownerId: string) {
    const booking = await this.getBookingForOwner(bookingId, ownerId);
    this.assertStatus(booking, 'PENDING', 'Chỉ có thể duyệt đơn đang chờ');

    return this.prisma.$transaction(async (tx) => {
      const alreadyCharged = await tx.transaction.count({
        where: {
          booking_id: bookingId,
          user_id: booking.user_id,
          type: 'RENTAL_FEE',
          status: 'SUCCESS',
        },
      });
      if (alreadyCharged === 0) {
        await this.chargeRenterOnConfirm(tx, booking);
      }

      return tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
        include: this.defaultBookingInclude(),
      });
    });
  }

  /**
   * Owner TỪ CHỐI yêu cầu → REJECTED.
   */
  async rejectBooking(bookingId: string, ownerId: string) {
    const booking = await this.getBookingForOwner(bookingId, ownerId);
    this.assertStatus(booking, 'PENDING', 'Chỉ có thể từ chối đơn đang chờ');

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'REJECTED' },
      include: this.defaultBookingInclude(),
    });
  }

  /**
   * Bước 4: Giao máy → ACTIVE.
   */
  async activateBooking(bookingId: string, ownerId: string) {
    const booking = await this.getBookingForOwner(bookingId, ownerId);
    this.assertStatus(
      booking,
      'CONFIRMED',
      'Chỉ có thể kích hoạt đơn đã xác nhận',
    );

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'ACTIVE' },
      include: this.defaultBookingInclude(),
    });
  }

  /**
   * Bước 5: Trả thiết bị + Bước 6: Kiểm tra → COMPLETED.
   * Owner xác nhận đã nhận lại thiết bị và tình trạng OK.
   */
  async completeBooking(bookingId: string, ownerId: string) {
    const booking = await this.getBookingForOwner(bookingId, ownerId);

    if (booking.status !== 'ACTIVE' && booking.status !== 'OVERDUE') {
      throw new BadRequestException(
        'Chỉ có thể hoàn tất đơn đang hoạt động hoặc quá hạn',
      );
    }

    // Tính phí trả trễ nếu có
    const lateFee = this.calculateLateFee(booking);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' },
        include: this.defaultBookingInclude(),
      });

      const paidRental = await tx.transaction.findFirst({
        where: {
          booking_id: bookingId,
          user_id: booking.user_id,
          type: 'RENTAL_FEE',
          status: 'SUCCESS',
        },
      });

      // Đơn cũ chưa qua bước trừ ví khi duyệt — không đụng ví để tránh lệch sổ
      if (!paidRental) {
        return { ...updated, late_fee: lateFee };
      }

      const depositAmt = Number(booking.deposit_amount || 0);
      const hasEscrow =
        booking.selected_deposit_type === 'MONEY_PLATFORM' && depositAmt > 0;
      const depositLocked = await tx.transaction.findFirst({
        where: {
          booking_id: bookingId,
          user_id: booking.user_id,
          type: 'DEPOSIT',
          status: 'SUCCESS',
        },
      });

      // Hoàn ký quỹ: pending → available + bản ghi REFUND
      if (hasEscrow && depositLocked) {
        const renterBefore = await tx.wallet.findUnique({
          where: { user_id: booking.user_id },
        });
        await tx.wallet.update({
          where: { user_id: booking.user_id },
          data: {
            pending_balance: { decrement: depositAmt },
            available_balance: { increment: depositAmt },
          },
        });
        const renterRefundTx = await tx.transaction.create({
          data: {
            booking_id: bookingId,
            user_id: booking.user_id,
            amount: depositAmt,
            type: 'REFUND',
            status: 'SUCCESS',
            payment_method: 'MOMO',
            description: `Hoàn cọc đơn thuê #${bookingId.slice(0, 8)}`,
          },
        });
        const renterAfter = await tx.wallet.findUnique({
          where: { user_id: booking.user_id },
        });
        if (renterBefore && renterAfter) {
          await this.walletLedger.appendIdempotent(tx, {
            wallet_id: renterBefore.id,
            booking_id: bookingId,
            booking_group_id: booking.booking_group_id ?? undefined,
            reference_transaction_id: renterRefundTx.id,
            bucket: 'AVAILABLE',
            direction: 'CREDIT',
            amount: depositAmt,
            available_before: Number(renterBefore.available_balance),
            available_after: Number(renterAfter.available_balance),
            pending_before: Number(renterBefore.pending_balance),
            pending_after: Number(renterAfter.pending_balance),
            note: 'Hoàn ký quỹ sau hoàn tất đơn',
            idempotency_key: `complete-renter-deposit-${bookingId}`,
          });
        }
      }

      // Chi trả chủ máy (luôn khi đơn đã thanh toán thuê lúc duyệt)
      const ownerPayout =
        Number(booking.total_price) - Number(booking.platform_fee_amount);

      const ownerWalletBefore = await tx.wallet.findUnique({
        where: { user_id: booking.owner_id },
      });

      await tx.wallet.upsert({
        where: { user_id: booking.owner_id },
        create: {
          user_id: booking.owner_id,
          available_balance: ownerPayout,
          pending_balance: 0,
        },
        update: {
          available_balance: { increment: ownerPayout },
        },
      });

      const ownerPayoutTx = await tx.transaction.create({
        data: {
          booking_id: bookingId,
          user_id: booking.owner_id,
          amount: ownerPayout,
          type: 'PAYOUT',
          status: 'SUCCESS',
          payment_method: 'BANK_TRANSFER',
          description: `Thanh toán tiền thuê đơn #${bookingId.slice(0, 8)}`,
        },
      });

      const ownerWalletAfter = await tx.wallet.findUnique({
        where: { user_id: booking.owner_id },
      });

      if (ownerWalletBefore && ownerWalletAfter) {
        await this.walletLedger.appendIdempotent(tx, {
          wallet_id: ownerWalletBefore.id,
          booking_id: bookingId,
          booking_group_id: booking.booking_group_id ?? undefined,
          reference_transaction_id: ownerPayoutTx.id,
          bucket: 'AVAILABLE',
          direction: 'CREDIT',
          amount: ownerPayout,
          available_before: Number(ownerWalletBefore.available_balance),
          available_after: Number(ownerWalletAfter.available_balance),
          pending_before: Number(ownerWalletBefore.pending_balance),
          pending_after: Number(ownerWalletAfter.pending_balance),
          note: 'Doanh thu đơn thuê (sau phí sàn) vào ví chủ máy',
          idempotency_key: `complete-owner-${bookingId}`,
        });
      } else if (ownerWalletAfter) {
        await this.walletLedger.appendIdempotent(tx, {
          wallet_id: ownerWalletAfter.id,
          booking_id: bookingId,
          booking_group_id: booking.booking_group_id ?? undefined,
          reference_transaction_id: ownerPayoutTx.id,
          bucket: 'AVAILABLE',
          direction: 'CREDIT',
          amount: ownerPayout,
          available_before: 0,
          available_after: Number(ownerWalletAfter.available_balance),
          pending_before: 0,
          pending_after: Number(ownerWalletAfter.pending_balance),
          note: 'Doanh thu đơn thuê (tạo ví mới)',
          idempotency_key: `complete-owner-${bookingId}`,
        });
      }

      await tx.bookingPayoutAllocation.updateMany({
        where: { booking_id: bookingId },
        data: { status: 'AVAILABLE' },
      });

      return { ...updated, late_fee: lateFee };
    });
  }

  /**
   * Hủy booking.
   */
  async cancelBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy đơn thuê');

    if (booking.user_id !== userId && booking.owner_id !== userId) {
      throw new BadRequestException('Bạn không có quyền hủy đơn này');
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new BadRequestException('Không thể hủy đơn ở trạng thái này');
    }

    if (booking.status === 'CONFIRMED') {
      return this.prisma.$transaction(async (tx) => {
        const charged = await tx.transaction.count({
          where: {
            booking_id: bookingId,
            user_id: booking.user_id,
            type: 'RENTAL_FEE',
            status: 'SUCCESS',
          },
        });
        if (charged > 0) {
          await this.releaseRenterOnCancelConfirmed(tx, booking);
        }

        return tx.booking.update({
          where: { id: bookingId },
          data: { status: 'CANCELLED' },
          include: this.defaultBookingInclude(),
        });
      });
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: this.defaultBookingInclude(),
    });
  }

  // ═══════════════════════════════════════════
  //  GIA HẠN
  // ═══════════════════════════════════════════

  async requestExtension(
    bookingId: string,
    userId: string,
    dto: ExtendBookingDto,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy đơn thuê');
    if (booking.user_id !== userId)
      throw new BadRequestException('Chỉ người thuê mới có thể gia hạn');
    if (booking.status !== 'ACTIVE')
      throw new BadRequestException('Chỉ gia hạn đơn đang hoạt động');

    const newEnd = new Date(dto.requested_end_date);
    if (newEnd <= booking.end_date) {
      throw new BadRequestException(
        'Ngày gia hạn phải sau ngày kết thúc hiện tại',
      );
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        is_extension_requested: true,
        requested_end_date: newEnd,
        extension_status: 'PENDING',
      },
      include: this.defaultBookingInclude(),
    });
  }

  async approveExtension(bookingId: string, ownerId: string) {
    const booking = await this.getBookingForOwner(bookingId, ownerId);
    if (
      !booking.is_extension_requested ||
      booking.extension_status !== 'PENDING'
    ) {
      throw new BadRequestException('Không có yêu cầu gia hạn đang chờ');
    }

    const extraDays = this.calculateRentalDays(
      booking.end_date,
      booking.requested_end_date!,
    );
    const pricePerDay = Number(booking.items[0]?.price_per_day || 0);
    const extraCost = pricePerDay * extraDays;
    const extraFee = Math.round(extraCost * PLATFORM_FEE_RATE * 100) / 100;
    const extraTotal = extraCost + extraFee;

    const lensId = booking.items[0]?.lens_id;
    const qty = booking.items[0]?.quantity ?? 1;
    if (!lensId) throw new BadRequestException('Đơn không có sản phẩm');

    return this.prisma.$transaction(async (tx) => {
      const extStart = new Date(booking.end_date);
      extStart.setHours(0, 0, 0, 0);
      extStart.setDate(extStart.getDate() + 1);

      const extEnd = new Date(booking.requested_end_date!);
      extEnd.setHours(0, 0, 0, 0);

      if (extStart <= extEnd) {
        await this.lensAvailability.assertLensAvailable(
          tx,
          lensId,
          extStart,
          extEnd,
          qty,
          bookingId,
        );
      }

      await tx.wallet.upsert({
        where: { user_id: booking.user_id },
        create: {
          user_id: booking.user_id,
          available_balance: 0,
          pending_balance: 0,
        },
        update: {},
      });

      const wallet = await tx.wallet.findUnique({
        where: { user_id: booking.user_id },
      });
      if (!wallet || Number(wallet.available_balance) < extraTotal) {
        throw new BadRequestException(
          `Người thuê không đủ số dư ví để gia hạn. Cần ${extraTotal}đ, hiện có ${wallet ? wallet.available_balance : 0}đ`,
        );
      }

      await tx.wallet.update({
        where: { user_id: booking.user_id },
        data: { available_balance: { decrement: extraTotal } },
      });

      await tx.transaction.create({
        data: {
          booking_id: bookingId,
          user_id: booking.user_id,
          amount: extraTotal,
          type: 'RENTAL_FEE',
          status: 'SUCCESS',
          payment_method: 'MOMO',
          description: `Phí gia hạn đơn #${bookingId.slice(0, 8)} (+${extraDays} ngày)`,
        },
      });

      return tx.booking.update({
        where: { id: bookingId },
        data: {
          end_date: booking.requested_end_date!,
          extension_status: 'APPROVED',
          sub_total: { increment: extraCost },
          total_price: { increment: extraTotal },
          platform_fee_amount: { increment: extraFee },
        },
        include: this.defaultBookingInclude(),
      });
    });
  }

  async rejectExtension(bookingId: string, ownerId: string) {
    const booking = await this.getBookingForOwner(bookingId, ownerId);
    if (
      !booking.is_extension_requested ||
      booking.extension_status !== 'PENDING'
    ) {
      throw new BadRequestException('Không có yêu cầu gia hạn đang chờ');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        extension_status: 'REJECTED',
        is_extension_requested: false,
        requested_end_date: null,
      },
      include: this.defaultBookingInclude(),
    });
  }

  // ─── PRIVATE HELPERS ───────────────────────

  /** 12 tháng gần nhất, key `YYYY-MM` (kết thúc tại tháng chỉ định hoặc hiện tại). */
  private buildLast12MonthYmKeys(endYear?: number, endMonth?: number): string[] {
    const keys: string[] = [];
    const anchor = new Date(
      endYear ?? new Date().getFullYear(),
      (endMonth ?? new Date().getMonth() + 1) - 1,
      1,
    );
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
      keys.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      );
    }
    return keys;
  }

  /**
   * Doanh thu theo tháng: tổng total_price đơn COMPLETED, gán vào tháng của updated_at (UTC).
   * (Không có completed_at; updated_at gần với lúc đơn được đánh dấu hoàn tất.)
   */
  private async buildOwnerMonthlyRevenueChart(
    ownerId: string,
    endYear?: number,
    endMonth?: number,
  ): Promise<{ label: string; value: number }[]> {
    const keys = this.buildLast12MonthYmKeys(endYear, endMonth);
    const rows = await this.prisma.$queryRaw<
      { ym: string; revenue: unknown }[]
    >`
      SELECT to_char(date_trunc('month', b.updated_at), 'YYYY-MM') AS ym,
             COALESCE(SUM(b.total_price), 0)::float AS revenue
      FROM bookings b
      WHERE b.owner_id = ${ownerId}::uuid
        AND b.status = 'COMPLETED'
      GROUP BY 1
      ORDER BY 1 ASC
    `;
    const byYm = new Map<string, number>();
    for (const r of rows) {
      byYm.set(r.ym, Number(r.revenue));
    }
    return keys.map((ym) => {
      const m = ym.match(/^(\d{4})-(\d{2})$/);
      const y = m?.[1];
      const mo = m?.[2];
      const label = y && mo ? `${parseInt(mo, 10)}/${y}` : ym;
      return { label, value: byYm.get(ym) ?? 0 };
    });
  }

  private computeMomPercent(series: { value: number }[]): number | null {
    if (!series?.length || series.length < 2) return null;
    const prev = series[series.length - 2]!.value;
    const last = series[series.length - 1]!.value;
    if (prev === 0) return last === 0 ? 0 : null;
    return Math.round(((last - prev) / prev) * 1000) / 10;
  }

  /**
   * % tin đăng APPROVED + available + chưa xóa hiện không có đơn ACTIVE/CONFIRMED chồng lên "hôm nay".
   */
  private async computeOwnerVacancyRate(ownerId: string): Promise<number> {
    const now = new Date();
    const totalListings = await this.prisma.lensListing.count({
      where: {
        owner_id: ownerId,
        is_deleted: false,
        approval_status: 'APPROVED',
        available: true,
      },
    });
    if (totalListings === 0) return 0;
    const busyGroups = await this.prisma.bookingItem.groupBy({
      by: ['lens_id'],
      where: {
        lens: { owner_id: ownerId },
        booking: {
          status: { in: ['ACTIVE', 'CONFIRMED'] },
          start_date: { lte: now },
          end_date: { gte: now },
        },
      },
    });
    const busy = busyGroups.length;
    const vacant = Math.max(0, totalListings - busy);
    return Math.round((vacant / totalListings) * 100);
  }

  /**
   * Top lens: doanh thu = phân bổ total_price đơn COMPLETED theo trọng số
   * (price_per_day × ngày thuê × quantity) trên từng dòng item.
   */
  private async buildOwnerTopLensesFromCompleted(
    ownerId: string,
    periodStart?: Date,
    periodEnd?: Date,
  ) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        owner_id: ownerId,
        status: 'COMPLETED',
        ...(periodStart && periodEnd
          ? { updated_at: { gte: periodStart, lte: periodEnd } }
          : {}),
      },
      select: {
        total_price: true,
        start_date: true,
        end_date: true,
        items: {
          select: { lens_id: true, price_per_day: true, quantity: true },
        },
      },
    });

    const revenueByLens = new Map<string, number>();
    const rentalLinesByLens = new Map<string, number>();

    for (const b of bookings) {
      const days = this.calculateRentalDays(
        new Date(b.start_date),
        new Date(b.end_date),
      );
      const lines = b.items.map((it) => ({
        lens_id: it.lens_id,
        w: Number(it.price_per_day) * days * Math.max(1, it.quantity ?? 1),
      }));
      const sumW = lines.reduce((s, l) => s + l.w, 0);
      const total = Number(b.total_price);
      if (lines.length === 0) continue;

      if (sumW <= 0) {
        const share = total / lines.length;
        for (const ln of lines) {
          revenueByLens.set(
            ln.lens_id,
            (revenueByLens.get(ln.lens_id) ?? 0) + share,
          );
          rentalLinesByLens.set(
            ln.lens_id,
            (rentalLinesByLens.get(ln.lens_id) ?? 0) + 1,
          );
        }
      } else {
        for (const ln of lines) {
          const share = total * (ln.w / sumW);
          revenueByLens.set(
            ln.lens_id,
            (revenueByLens.get(ln.lens_id) ?? 0) + share,
          );
          rentalLinesByLens.set(
            ln.lens_id,
            (rentalLinesByLens.get(ln.lens_id) ?? 0) + 1,
          );
        }
      }
    }

    const topIds = [...revenueByLens.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    if (topIds.length === 0) return [];

    const lenses = await this.prisma.lensListing.findMany({
      where: { id: { in: topIds } },
      select: {
        id: true,
        title: true,
        brand: true,
        thumbnail: true,
        category: { select: { name: true } },
        images: {
          take: 1,
          orderBy: { id: 'asc' },
          select: { image_url: true },
        },
      },
    });
    const byId = new Map(lenses.map((l) => [l.id, l]));

    return topIds.map((id) => {
      const lens = byId.get(id);
      const rev = revenueByLens.get(id) ?? 0;
      const rentals = rentalLinesByLens.get(id) ?? 0;
      return {
        id,
        title: lens?.title ?? 'Unknown',
        category_name: lens?.category?.name || lens?.brand || '',
        thumbnail:
          lens?.images?.[0]?.image_url ||
          lens?.thumbnail ||
          'https://placehold.co/100',
        rentals,
        revenue: Math.round(rev * 100) / 100,
      };
    });
  }

  private calculateRentalDays(start: Date, end: Date): number {
    const diffMs = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  private calculateLateFee(booking: any): number {
    if (booking.status !== 'ACTIVE' && booking.status !== 'OVERDUE') return 0;

    const now = new Date();
    if (now <= new Date(booking.end_date)) return 0;

    const overdueDays = this.calculateRentalDays(
      new Date(booking.end_date),
      now,
    );
    const pricePerDay = booking.items?.[0]
      ? Number(booking.items[0].price_per_day)
      : Number(booking.sub_total) /
        this.calculateRentalDays(booking.start_date, booking.end_date);

    return Math.round(overdueDays * pricePerDay * 1.5 * 100) / 100; // 150% giá/ngày
  }

  private async getBookingForOwner(bookingId: string, ownerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: true },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy đơn thuê');
    if (booking.owner_id !== ownerId) {
      throw new BadRequestException(
        'Bạn không phải chủ sản phẩm của đơn thuê này',
      );
    }
    return booking;
  }

  private assertStatus(booking: any, expected: string, message: string) {
    if (booking.status !== expected) {
      throw new BadRequestException(message);
    }
  }

  private defaultBookingInclude() {
    return {
      items: { include: { lens: { include: { images: true } } } },
      owner: { select: { id: true, full_name: true, phone: true } },
      user: { select: { id: true, full_name: true, phone: true } },
    };
  }

  /**
   * Khi owner duyệt đơn: trừ ví người thuê (tiền thuê + tiền ký quỹ nếu có).
   * Tiền ký quỹ MONEY_PLATFORM → pending_balance (đóng băng).
   */
  private async chargeRenterOnConfirm(tx: any, booking: any) {
    const totalPrice = Number(booking.total_price);
    const deposit =
      booking.selected_deposit_type === 'MONEY_PLATFORM' &&
      booking.deposit_amount != null
        ? Number(booking.deposit_amount)
        : 0;
    const totalDebit = totalPrice + deposit;

    await tx.wallet.upsert({
      where: { user_id: booking.user_id },
      create: {
        user_id: booking.user_id,
        available_balance: 0,
        pending_balance: 0,
      },
      update: {},
    });

    const wBefore = await tx.wallet.findUnique({
      where: { user_id: booking.user_id },
    });
    if (!wBefore || Number(wBefore.available_balance) < totalDebit) {
      throw new BadRequestException(
        `Người thuê không đủ số dư ví để duyệt đơn. Cần ${totalDebit}đ (thuê ${totalPrice}đ${
          deposit ? ` + ký quỹ ${deposit}đ` : ''
        }), hiện có ${wBefore ? wBefore.available_balance : 0}đ`,
      );
    }

    const rentalTx = await tx.transaction.create({
      data: {
        booking_id: booking.id,
        user_id: booking.user_id,
        amount: totalPrice,
        type: 'RENTAL_FEE',
        status: 'SUCCESS',
        payment_method: 'CASH',
        description: `Thanh toán tiền thuê đơn #${String(booking.id).slice(0, 8)} (trừ ví)`,
      },
    });

    if (deposit > 0) {
      await tx.transaction.create({
        data: {
          booking_id: booking.id,
          user_id: booking.user_id,
          amount: deposit,
          type: 'DEPOSIT',
          status: 'SUCCESS',
          payment_method: 'CASH',
          description: `Ký quỹ (nền tảng giữ) đơn #${String(booking.id).slice(0, 8)} (trừ ví)`,
        },
      });
    }

    await tx.wallet.update({
      where: { user_id: booking.user_id },
      data: {
        available_balance: { decrement: totalDebit },
        ...(deposit > 0 ? { pending_balance: { increment: deposit } } : {}),
      },
    });

    const wAfter = await tx.wallet.findUnique({
      where: { user_id: booking.user_id },
    });

    await this.walletLedger.appendIdempotent(tx, {
      wallet_id: wBefore.id,
      booking_id: booking.id,
      booking_group_id: booking.booking_group_id ?? undefined,
      reference_transaction_id: rentalTx.id,
      bucket: 'AVAILABLE',
      direction: 'DEBIT',
      amount: totalDebit,
      available_before: Number(wBefore.available_balance),
      available_after: Number(wAfter!.available_balance),
      pending_before: Number(wBefore.pending_balance),
      pending_after: Number(wAfter!.pending_balance),
      note: `Trừ ví khi chủ duyệt đơn (tiền thuê + ký quỹ nền tảng nếu có)`,
      idempotency_key: `confirm-charge-${booking.id}`,
    });
  }

  /** Hủy đơn sau khi đã CONFIRMED: hoàn tiền thuê + giải phóng ký quỹ về available. */
  private async releaseRenterOnCancelConfirmed(tx: any, booking: any) {
    const totalPrice = Number(booking.total_price);
    const deposit =
      booking.selected_deposit_type === 'MONEY_PLATFORM' &&
      booking.deposit_amount != null
        ? Number(booking.deposit_amount)
        : 0;

    const renterBefore = await tx.wallet.findUnique({
      where: { user_id: booking.user_id },
    });

    const data: Record<string, unknown> = {
      available_balance: { increment: totalPrice + deposit },
    };
    if (deposit > 0) {
      data.pending_balance = { decrement: deposit };
    }

    await tx.wallet.update({
      where: { user_id: booking.user_id },
      data,
    });

    const refundTx = await tx.transaction.create({
      data: {
        booking_id: booking.id,
        user_id: booking.user_id,
        amount: totalPrice + deposit,
        type: 'REFUND',
        status: 'SUCCESS',
        payment_method: 'CASH',
        description: `Hoàn tiền do hủy đơn sau khi đã duyệt #${String(booking.id).slice(0, 8)}`,
      },
    });

    const renterAfter = await tx.wallet.findUnique({
      where: { user_id: booking.user_id },
    });

    if (renterBefore && renterAfter) {
      await this.walletLedger.appendIdempotent(tx, {
        wallet_id: renterBefore.id,
        booking_id: booking.id,
        booking_group_id: booking.booking_group_id ?? undefined,
        reference_transaction_id: refundTx.id,
        bucket: 'AVAILABLE',
        direction: 'CREDIT',
        amount: totalPrice + deposit,
        available_before: Number(renterBefore.available_balance),
        available_after: Number(renterAfter.available_balance),
        pending_before: Number(renterBefore.pending_balance),
        pending_after: Number(renterAfter.pending_balance),
        note: 'Hoàn tiền thuê + giải phóng ký quỹ (hủy sau duyệt)',
        idempotency_key: `cancel-refund-${booking.id}`,
      });
    }
  }
}
