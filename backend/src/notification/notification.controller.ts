// notifications.controller.ts
import { Controller, Get, Patch, Param, UseGuards, Request, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { JwtGuard } from '../auth/strategies/jwt.guard';

@Controller('notifications')
@UseGuards(JwtGuard) 
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@Request() req) {
    // req.user.id được lấy từ JWT Token
    return this.notificationsService.findByUser(req.user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }


  // @Post('test-create')
  // async testCreate(@Body() body: any) {
  //   return this.notificationsService.create({
  //     userId: body.userId, // ID của user bạn muốn gửi tới
  //     title: body.title,
  //     content: body.content,
  //     type: body.type || 'SYSTEM',
  //     referenceId: body.referenceId
  //   });
  // }
}