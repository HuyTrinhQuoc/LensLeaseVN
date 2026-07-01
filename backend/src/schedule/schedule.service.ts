import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DeviceScheduleService {
  constructor(private prisma: PrismaService) {}

  // 1. Lấy danh sách thiết bị (LensListing) của Owner
  async getOwnerEquipments(ownerId: string) {
    return this.prisma.lensListing.findMany({
      where: { 
        owner_id: ownerId, 
        is_deleted: false 
      },
      select: {
        id: true,
        title: true,
        thumbnail: true, // DB của bạn dùng trường 'thumbnail'
      },
      orderBy: { created_at: 'desc' }
    });
  }

  // 2. Lấy danh sách sự kiện (Lịch thuê + Lịch khóa)
  async getEquipmentEvents(lensId: string) {
    // 2.1 Lấy lịch có khách đang thuê (Từ BookingItem -> Booking)
    const bookingItems = await this.prisma.bookingItem.findMany({
      where: {
        lens_id: lensId,
        booking: {
          // Chỉ lấy các trạng thái đang có lịch giữ máy
          status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] }, 
        },
      },
      include: {
        booking: {
          include: { user: { select: { full_name: true } } },
        },
      },
    });

    // 2.2 Lấy lịch Owner tự khóa (Từ BlockedDate)
    const blockedDates = await this.prisma.blockedDate.findMany({
      where: { lens_id: lensId },
    });

    // 2.3 Gom chung vào một format mảng Events
    const events = [
      ...bookingItems.map((item) => ({
        id: item.booking.id,
        type: 'BOOKING',
        start_date: item.booking.start_date,
        end_date: item.booking.end_date,
        label: `Thuê: ${item.booking.user?.full_name || 'Khách'}`,
        status: item.booking.status,
      })),
      ...blockedDates.map((block) => ({
        id: block.id,
        type: 'BLOCKED',
        start_date: block.start_date,
        end_date: block.end_date,
        label: block.reason || 'Đã khóa',
        status: 'BLOCKED',
      })),
    ];

    return events;
  }
}