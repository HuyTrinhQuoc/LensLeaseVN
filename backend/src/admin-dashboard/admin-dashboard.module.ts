import { Module } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { PrismaService } from '../prisma.service'; // Import module kết nối Prisma của bạn

@Module({

  controllers: [AdminDashboardController],
  providers: [AdminDashboardService, PrismaService],
})
export class AdminDashboardModule {}