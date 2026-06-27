

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Đảm bảo đúng đường dẫn tới file PrismaService của bạn
import { DashboardFilterDto, DashboardFilterType } from './dto/dashboard-filter.dto';
import { BookingStatus, ApprovalStatus } from '@prisma/client';
import { 
  startOfDay, endOfDay, startOfMonth, endOfMonth, 
  startOfYear, endOfYear, parseISO, eachDayOfInterval, format 
} from 'date-fns';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardMetrics(filterDto: DashboardFilterDto) {
    // 1. Lấy mốc thời gian bắt đầu và kết thúc
    const { start, end } = this.calculateDateRange(filterDto);
    const dateFilter = { gte: start, lte: end };

    // 2. Chạy Query lấy dữ liệu
    const [
      gmvAndCommission,
      activeRentalsCount,
      newUsersCount,
      pendingKycCount,
      escrowStats,
      revenueRawData,
      categoryStatsRaw
    ] = await Promise.all([
      // TỔNG GMV & HOA HỒNG
      this.prisma.booking.aggregate({
        _sum: { total_price: true, platform_fee_amount: true },
        where: { created_at: dateFilter, status: { notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED] } },
      }),
      // ĐƠN ĐANG CHẠY
      this.prisma.booking.count({ where: { status: BookingStatus.ACTIVE } }),
      // USER MỚI
      this.prisma.user.count({ where: { created_at: dateFilter, is_deleted: false } }),
      // KYC CHỜ DUYỆT
      this.prisma.user.count({ where: { kyc_status: ApprovalStatus.PENDING, is_deleted: false } }),
      // TIỀN TẠM GIỮ (CỌC)
      this.prisma.booking.aggregate({
        _sum: { deposit_amount: true },
        _count: { id: true },
        where: { status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] } },
      }),
      // RAW DATA DOANH THU CỘT
      this.prisma.booking.findMany({
        where: { created_at: dateFilter, status: BookingStatus.COMPLETED },
        select: { created_at: true, total_price: true },
        orderBy: { created_at: 'asc' },
      }),
      // RAW DATA DANH MỤC TRÒN
      this.prisma.bookingItem.findMany({
        where: { booking: { created_at: dateFilter, status: { notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED] } } },
        select: { quantity: true, lens: { select: { category: { select: { name: true } } } } },
      }),
    ]);

    // 3. Format dữ liệu trả về
    const revenueChart = this.formatRevenueChart(revenueRawData, filterDto.type, start, end);
    const categoryChart = this.formatCategoryChart(categoryStatsRaw);

    return {
      metrics: {
        gmv: Number(gmvAndCommission._sum.total_price || 0),
        commission: Number(gmvAndCommission._sum.platform_fee_amount || 0),
        activeRentals: activeRentalsCount,
        newUsers: newUsersCount,
        pendingKyc: pendingKycCount,
        escrowBalance: Number(escrowStats._sum.deposit_amount || 0),
        escrowCount: escrowStats._count.id,
      },
      charts: {
        revenueChart, // Đã fix: Trải đều thời gian, không bị thiếu ngày/tháng
        categoryChart, // Đã fix: Chắc chắn là lấy từ BookingItem -> Lens -> Category
      },
    };
  }

  // ==========================================
  // HÀM HỖ TRỢ: TÍNH TOÁN NGÀY THÁNG
  // ==========================================
  private calculateDateRange(filterDto: DashboardFilterDto): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (filterDto.type) {
      case DashboardFilterType.DAY:
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case DashboardFilterType.MONTH:
        start = startOfMonth(now);
        end = endOfDay(now); // Lấy tới cuối ngày hiện tại hoặc endOfMonth(now)
        break;
      case DashboardFilterType.YEAR:
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case DashboardFilterType.CUSTOM:
        if (!filterDto.startDate || !filterDto.endDate) {
          throw new BadRequestException('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc');
        }
        start = startOfDay(parseISO(filterDto.startDate));
        end = endOfDay(parseISO(filterDto.endDate));
        break;
      default:
        start = startOfYear(now);
        end = endOfYear(now);
    }

    return { start, end };
  }

  // ==========================================
  // HÀM HỖ TRỢ: FORMAT BIỂU ĐỒ DOANH THU (CHỐNG MẤT DỮ LIỆU)
  // ==========================================
  private formatRevenueChart(rawBookings: any[], type: DashboardFilterType, start: Date, end: Date) {
    const groups: { [key: string]: number } = {};
    const labels: string[] = [];

    // 1. Dựng sẵn trục X với các giá trị mặc định là 0
    if (type === DashboardFilterType.YEAR) {
      // Nếu là năm -> Tạo sẵn 12 tháng
      for (let i = 1; i <= 12; i++) {
        const label = `Tháng ${i}`;
        labels.push(label);
        groups[label] = 0;
      }
    } else if (type === DashboardFilterType.MONTH || type === DashboardFilterType.CUSTOM) {
      // Nếu là tháng hoặc tùy chỉnh -> Trải đều từng ngày từ start đến end
      const days = eachDayOfInterval({ start, end });
      days.forEach(day => {
        const label = format(day, 'dd/MM'); // Hiển thị ngày/tháng cho gọn (VD: 01/12)
        labels.push(label);
        groups[label] = 0;
      });
    } else if (type === DashboardFilterType.DAY) {
      // Nếu chỉ xem hôm nay
      const label = format(start, 'dd/MM/yyyy');
      labels.push(label);
      groups[label] = 0;
    }

    // 2. Lắp dữ liệu lấy từ Database vào đúng các mốc thời gian đã tạo
    rawBookings.forEach((b) => {
      const date = new Date(b.created_at);
      let label = '';

      if (type === DashboardFilterType.YEAR) {
        label = `Tháng ${date.getMonth() + 1}`;
      } else if (type === DashboardFilterType.MONTH || type === DashboardFilterType.CUSTOM) {
        label = format(date, 'dd/MM');
      } else {
        label = format(date, 'dd/MM/yyyy');
      }

      // Cộng dồn doanh thu vào ngày/tháng đó
      if (groups[label] !== undefined) {
        groups[label] += Number(b.total_price);
      }
    });

    // 3. Trả về mảng chuẩn cấu trúc Chart.js
    return labels.map((label) => ({
      label,
      value: groups[label],
    }));
  }

  // ==========================================
  // HÀM HỖ TRỢ: FORMAT BIỂU ĐỒ DANH MỤC TRÒN
  // ==========================================
  private formatCategoryChart(rawItems: any[]) {
    const categoryMap: { [key: string]: number } = {};

    rawItems.forEach((item) => {
      // Liên kết dữ liệu dựa vào Prisma schema: BookingItem -> lens -> category -> name
      // Nếu đường dẫn lens.category.name bị sai so với schema thực tế của bạn, hãy sửa lại ở đây.
      const catName = item.lens?.category?.name || 'Chưa phân loại';
      categoryMap[catName] = (categoryMap[catName] || 0) + item.quantity;
    });

    return Object.keys(categoryMap).map((key) => ({
      label: key,
      value: categoryMap[key],
    }));
  }
}