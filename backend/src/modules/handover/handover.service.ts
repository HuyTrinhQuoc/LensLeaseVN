import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

  // 2. Tạo hoặc Cập nhật biên bản giao máy (Check-in) -> Luồng động tuần tự
  async processCheckIn(bookingId: string, dto: CreateCheckInDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        items: true,
        handoverReport: true,
      },
    });

    if (!booking)
      throw new NotFoundException('Không tìm thấy đơn đặt thuê này');

    // Bảo vệ trạng thái: Chỉ được check-in khi đang ở trạng thái CONFIRMED
    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Đơn hàng phải ở trạng thái [CONFIRMED] mới có thể lập biên bản giao máy',
      );
    }

    const lensIds = booking.items.map((item) => item.lens_id);

    // Chuẩn bị Object dữ liệu cập nhật an toàn (chỉ update nếu có chuỗi hợp lệ)
    const updateData: any = {};
    if (dto.note_checkin !== undefined) updateData.note_checkin = dto.note_checkin;
    if (dto.images_checkin !== undefined) updateData.images_checkin = dto.images_checkin;
    if (dto.signature_a) updateData.signature_a = dto.signature_a;
    if (dto.signature_b) updateData.signature_b = dto.signature_b;

    // Chạy Transaction đảm bảo tính toàn vẹn dữ liệu
    const [report] = await this.prisma.$transaction(
      async (tx) => {
        const handover = await tx.handoverReport.upsert({
          where: { booking_id: bookingId },
          update: updateData,
          create: {
            booking_id: bookingId,
            note_checkin: dto.note_checkin || '',
            images_checkin: dto.images_checkin || [],
            signature_a: dto.signature_a || null,
            signature_b: dto.signature_b || null,
          },
        });

        // BƯỚC ĐIỀU KIỆN QUYẾT ĐỊNH KÍCH HOẠT ĐƠN HÀNG (ACTIVE)
        if (handover.signature_a && handover.signature_b) {
          // Cập nhật trạng thái đơn sang ACTIVE
          await tx.booking.update({
            where: { id: bookingId },
            data: { status: 'ACTIVE' },
          });

          // Chuyển toàn bộ thiết bị trong đơn sang trạng thái ĐÃ ĐỢC THUÊ
          await tx.lensListing.updateMany({
            where: { id: { in: lensIds } },
            data: { available: false },
          });
        }

        return [handover];
      },
      {
        maxWait: 15000, 
        timeout: 30000, 
      },
    );

    const isFullySigned = report.signature_a && report.signature_b;
    return {
      message: isFullySigned
        ? 'Cả hai bên đã ký xong! Thiết bị bàn giao thành công, đơn hàng chuyển sang Đang thuê.'
        : 'Ghi nhận chữ ký thành công! Đang chờ đối phương xác nhận ký.',
      data: report,
    };
  }

  // 3. Cập nhật biên bản lúc nhận lại máy -> Nghiệm thu hoàn cọc cho người thuê
  async processCheckOut(bookingId: string, dto: CreateCheckOutDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        items: true,
        booking_payout_allocation: true,
      },
    });

    if (!booking)
      throw new NotFoundException('Không tìm thấy đơn đặt thuê này');

    // Bảo vệ trạng thái: chỉ cho check-out khi đơn đang ACTIVE (chặn double-payout nếu gọi lại lần 2)
    if (booking.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Đơn hàng phải ở trạng thái [ACTIVE] mới có thể nghiệm thu Check-out. Đơn này có thể đã được xử lý trước đó.',
      );
    }

    // Chặn lỗi: Phải trải qua mốc check-in thì mới cho phép kết thúc đơn
    const reportExists = await this.prisma.handoverReport.findUnique({
      where: { booking_id: bookingId },
    });

    if (!reportExists) {
      throw new BadRequestException(
        'Không thể thực hiện check-out vì đơn hàng này chưa lập biên bản check-in giao máy.',
      );
    }

    const lensIds = booking.items.map((item) => item.lens_id);
    // Nếu máy hỏng (is_damaged = true) -> Giữ trạng thái available = false để chủ máy xử lý/sửa chữa
    const shouldBeAvailable = dto.is_damaged ? false : true;

    const [updatedReport] = await this.prisma.$transaction(
      async (tx) => {
        // a. Cập nhật thông tin mốc hoàn trả
        const report = await tx.handoverReport.update({
          where: { booking_id: bookingId },
          data: {
            note_checkout: dto.note_checkout || '',
            images_checkout: dto.images_checkout || [],
            is_damaged: dto.is_damaged,
            signature_checkout: dto.signature_checkout,
          },
        });

        // b. Chuyển trạng thái đơn hàng về đích hoàn tất [COMPLETED]
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: 'COMPLETED' },
        });

        // c. Cập nhật lại kho trạng thái thiết bị
        await tx.lensListing.updateMany({
          where: { id: { in: lensIds } },
          data: { available: shouldBeAvailable },
        });

        // d. ĐIỀU PHỐI DÒNG TIỀN DOANH THU ĐẾN VÍ CHỦ THIẾT BỊ
        if (booking.booking_payout_allocation) {
          const allocation = booking.booking_payout_allocation;
          const netAmount = allocation.net_amount;

          const ownerWallet = await tx.wallet.findUnique({
            where: { user_id: booking.owner_id },
          });

          if (ownerWallet) {
            // Trừ dư nợ đóng băng tạm thời và cộng thẳng số dư khả dụng được rút
            const updatedWallet = await tx.wallet.update({
              where: { user_id: booking.owner_id },
              data: {
                pending_balance: { decrement: netAmount },
                available_balance: { increment: netAmount },
              },
            });

            // Tạo lịch sử biến động số dư phục vụ báo cáo kế toán
            await tx.walletTransaction.create({
              data: {
                wallet_id: ownerWallet.id,
                booking_id: booking.id,
                bucket: 'AVAILABLE',
                direction: 'CREDIT',
                amount: netAmount,
                available_before: ownerWallet.available_balance,
                available_after: updatedWallet.available_balance,
                pending_before: ownerWallet.pending_balance,
                pending_after: updatedWallet.pending_balance,
                note: `Giải ngân doanh thu hoàn tất đơn thuê #${booking.id.slice(0, 8).toUpperCase()}`,
              },
            });
          }

          await tx.bookingPayoutAllocation.update({
            where: { booking_id: bookingId },
            data: { status: 'AVAILABLE' },
          });
        }

        return [report];
      },
      {
        maxWait: 15000, 
        timeout: 30000, 
      },
    );

    return {
      message: 'Xác nhận trả máy thành công! Tiền thuê đã được giải ngân vào tài khoản khả dụng của chủ máy.',
      data: updatedReport,
    };
  }
}