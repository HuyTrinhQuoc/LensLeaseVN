import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service'; 
import { CreateCheckInDto, CreateCheckOutDto } from './dto/handover.dto';

@Injectable()
export class HandoverService {
  constructor(private prisma: PrismaService) {}

  // 1. Lấy biên bản của 1 đơn hàng
  async getReportByBooking(bookingId: string) {
    const report = await this.prisma.handoverReport.findUnique({
      where: { booking_id: bookingId },
    });
    return report;
  }

  // 2. Tạo hoặc Cập nhật biên bản giao máy (Check-in) -> Kích hoạt đơn sang ACTIVE
  async processCheckIn(bookingId: string, dto: CreateCheckInDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new NotFoundException('Không tìm thấy đơn đặt thuê này');
    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Đơn hàng phải ở trạng thái [CONFIRMED] mới có thể lập biên bản giao máy');
    }

    // Thực hiện đồng thời: Lưu biên bản và Đổi trạng thái đơn hàng sang ACTIVE
    const [report] = await this.prisma.$transaction([
      this.prisma.handoverReport.upsert({
        where: { booking_id: bookingId },
        update: {
          note_checkin: dto.note_checkin,
          images_checkin: dto.images_checkin,
          signature_a: dto.signature_a,
          signature_b: dto.signature_b,
        },
        create: {
          booking_id: bookingId,
          note_checkin: dto.note_checkin,
          images_checkin: dto.images_checkin,
          signature_a: dto.signature_a,
          signature_b: dto.signature_b,
        },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'ACTIVE' },
      }),
    ]);

    return { message: 'Đã hoàn tất bàn giao máy, đơn hàng chuyển sang trạng thái đang thuê', data: report };
  }

  // 3. Cập nhật biên bản lúc nhận lại máy
  async processCheckOut(bookingId: string, dto: CreateCheckOutDto) {
    const reportExists = await this.prisma.handoverReport.findUnique({
      where: { booking_id: bookingId },
    });

    if (!reportExists) {
      throw new BadRequestException('Không thể thực hiện check-out vì đơn hàng này chưa lập biên bản check-in giao máy.');
    }
    const [updatedReport] = await this.prisma.$transaction([
      this.prisma.handoverReport.update({
        where: { booking_id: bookingId },
        data: {
          note_checkout: dto.note_checkout,
          images_checkout: dto.images_checkout,
          is_damaged: dto.is_damaged,
        },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' },
      }),
    ]);

    return { 
      message: 'Xác nhận trả máy thành công! Đơn hàng đã chuyển sang trạng thái COMPLETED.', 
      data: updatedReport 
    };
  }
}