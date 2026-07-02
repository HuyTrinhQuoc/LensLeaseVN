import { Module } from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService]
})
export class NotificationModule {}
