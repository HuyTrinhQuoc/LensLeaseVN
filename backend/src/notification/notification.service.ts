// notifications.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // 1. Dùng nội bộ backend: Khi có booking mới, message mới, hệ thống tự gọi hàm này
  async create(data: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        user_id: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
        reference_id: data.referenceId,
      },
    });
  }

  // 2. Lấy danh sách thông báo của 1 user
  async findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50, // Giới hạn 50 thông báo gần nhất
    });
  }

  // 3. Đánh dấu 1 thông báo đã đọc (is_read: true)
  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { 
        id: id,
        user_id: userId // Đảm bảo user chỉ sửa thông báo của mình
      },
      data: { is_read: true }, // [cite: 122, 123]
    });
  }

  // 4. Đánh dấu tất cả đã đọc
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
  }
}