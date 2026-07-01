import { Module } from '@nestjs/common';
import { NotificationsController } from './admin-notification.controller';
import { NotificationsService } from './admin-notification.service';
import { NotificationsGateway } from './admin-notification.gateway';
import { PrismaService } from '../prisma.service';

@Module({

  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, PrismaService],
  exports: [NotificationsGateway], // Export để các module khác (VD: OrderModule) dùng được
})
export class AdminNotificationModule {}