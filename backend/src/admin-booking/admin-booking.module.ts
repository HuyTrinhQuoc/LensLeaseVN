import { Module } from '@nestjs/common';
import { AdminBookingService } from './admin-booking.service';
import { AdminBookingController } from './admin-booking.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AdminBookingController],
  providers: [AdminBookingService,PrismaService ],
})
export class AdminBookingModule {}
