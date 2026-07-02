import { Module } from '@nestjs/common';
import { UserNotificationsController } from './admin-notification.controller';
import { NotificationsService } from './admin-notification.service';
import { NotificationsGateway } from './admin-notification.gateway';
import { PrismaService } from '../prisma.service';

@Module({

  controllers: [UserNotificationsController],
  providers: [NotificationsService, NotificationsGateway, PrismaService],
  exports: [NotificationsGateway, NotificationsService], // Export để các module khác (VD: OrderModule) dùng được
})
export class AdminNotificationModule {}