import { Controller, Get, Patch, Param, Post, Body, Query } from '@nestjs/common';
import { NotificationsService } from './admin-notification.service';
import { NotificationType } from '@prisma/client';

@Controller('admin/notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  // Lấy thông báo (Cần truyền adminId lên, thực tế bạn nên lấy từ AuthGuard/JWT)
  @Get()
  async getNotifications(@Query('adminId') adminId: string) {
    if (!adminId) return { data: [] };
    
    const data = await this.notificationsService.getUnreadAdminNotifications(adminId);
    return { data };
  }

  // Đánh dấu 1 thông báo đã đọc
  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    await this.notificationsService.markAsRead(id);
    return { success: true, message: 'Đã đánh dấu đọc' };
  }

  // Đánh dấu tất cả đã đọc
  @Post('read-all')
  async markAllRead(@Body('adminId') adminId: string) {
    await this.notificationsService.markAllAsRead(adminId);
    return { success: true, message: 'Đã đánh dấu đọc tất cả' };
  }

  // API TEST: Giả lập việc một Service khác (vd: BookingService) trigger thông báo
  @Post('test-trigger')
  async testTriggerRealtime(@Body() body: any) {
    await this.notificationsService.createAdminNotification(
      body.title || 'Có biến mới!',
      body.content || 'Nội dung test',
      body.type || NotificationType.SYSTEM,
      body.reference_id || null
    );

    return { success: true, message: 'Đã lưu vào DB và bắn tín hiệu Socket!' };
  }
}