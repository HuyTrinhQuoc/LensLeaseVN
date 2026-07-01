import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Đường dẫn tới Prisma
import { NotificationType } from '@prisma/client';
import { NotificationsGateway } from './admin-notification.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway
  ) {}

  // 1. Lấy danh sách thông báo chưa đọc của 1 Admin cụ thể
  async getUnreadAdminNotifications(adminId: string) {
    return this.prisma.notification.findMany({
      where: {
        user_id: adminId,
        is_read: false,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // 2. Đánh dấu 1 thông báo đã đọc
  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
  }

  // 3. Đánh dấu tất cả thông báo của 1 Admin là đã đọc
  async markAllAsRead(adminId: string) {
    return this.prisma.notification.updateMany({
      where: { user_id: adminId, is_read: false },
      data: { is_read: true },
    });
  }

  // 4. Hàm cốt lõi: Tạo thông báo mới cho TOÀN BỘ Admin và bắn Socket
  async createAdminNotification(
    title: string,
    content: string,
    type: NotificationType, // enum: SYSTEM, BOOKING, MESSAGE, PROMOTION
    reference_id?: string
  ) {
    // Lấy ID của tất cả người dùng có quyền ADMIN và tài khoản đang ACTIVE
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', status: 'ACTIVE' },
      select: { id: true },
    });

    if (admins.length === 0) return;

    // Chuẩn bị dữ liệu để insert nhiều dòng cùng lúc (mỗi admin 1 dòng thông báo)
    const notificationsData = admins.map(admin => ({
      user_id: admin.id,
      title,
      content,
      type,
      reference_id,
    }));

    // Lưu tất cả vào Database
    await this.prisma.notification.createMany({
      data: notificationsData,
    });

    // Sau khi lưu DB xong, bắn tín hiệu Realtime qua Gateway tới 'admins_room'
    const socketPayload = {
      title,
      content,
      type,
      reference_id,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    this.notificationsGateway.sendToAdmins(socketPayload);
  }

  // HÀM MỚI: Tạo thông báo cho 1 User (Owner/Renter)
  async createUserNotification(
    userId: string,
    title: string,
    content: string,
    type: NotificationType, 
    reference_id?: string
  ) {
    // 1. Lưu vào Database
    const notification = await this.prisma.notification.create({
      data: {
        user_id: userId,
        title,
        content,
        type,
        reference_id,
        is_read: false,
      },
    });

    // 2. Bắn Socket Realtime cho đúng user đó
    this.notificationsGateway.sendToUser(userId, notification);

    return notification;
  }
}