import { Controller, Get, Patch, Param, Post, Body, Query } from '@nestjs/common';
import { NotificationsService } from './admin-notification.service';
import { NotificationType } from '@prisma/client';

// @Controller('admin/notifications')
// export class NotificationsController {
//   constructor(
//     private readonly notificationsService: NotificationsService,
//   ) {}

//   // Lấy thông báo (Cần truyền adminId lên, thực tế bạn nên lấy từ AuthGuard/JWT)
//   @Get()
//   async getNotifications(@Query('adminId') adminId: string) {
//     if (!adminId) return { data: [] };
    
//     const data = await this.notificationsService.getUnreadAdminNotifications(adminId);
//     return { data };
//   }

//   // Đánh dấu 1 thông báo đã đọc
//   @Patch(':id/read')
//   async markRead(@Param('id') id: string) {
//     await this.notificationsService.markAsRead(id);
//     return { success: true, message: 'Đã đánh dấu đọc' };
//   }

//   // Đánh dấu tất cả đã đọc
//   @Post('read-all')
//   async markAllRead(@Body('adminId') adminId: string) {
//     await this.notificationsService.markAllAsRead(adminId);
//     return { success: true, message: 'Đã đánh dấu đọc tất cả' };
//   }

//   // API TEST: Giả lập việc một Service khác (vd: BookingService) trigger thông báo
//   @Post('test-trigger')
//   async testTriggerRealtime(@Body() body: any) {
//     await this.notificationsService.createAdminNotification(
//       body.title || 'Có biến mới!',
//       body.content || 'Nội dung test',
//       body.type || NotificationType.SYSTEM,
//       body.reference_id || null
//     );

//     return { success: true, message: 'Đã lưu vào DB và bắn tín hiệu Socket!' };
//   }
// }



// Route CHUNG cho USER / OWNER lấy thông báo của chính họ.
// Dùng lại NotificationsService vì các hàm đó chỉ lọc theo user_id,
// không có logic riêng cho admin.
@Controller('notifications')
export class UserNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // TODO: thay @Query('userId') bằng lấy từ AuthGuard/JWT (req.user.id)
  // trước khi lên production, tránh việc client tự truyền userId bất kỳ.
  @Get()
  async getMyNotifications(@Query('userId') userId: string) {
    if (!userId) return { data: [] };
    const data =
      await this.notificationsService.getUnreadAdminNotifications(userId);
    return { data };
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    await this.notificationsService.markAsRead(id);
    return { success: true, message: 'Đã đánh dấu đọc' };
  }

  @Post('read-all')
  async markAllRead(@Body('userId') userId: string) {
    await this.notificationsService.markAllAsRead(userId);
    return { success: true, message: 'Đã đánh dấu đọc tất cả' };
  }
}