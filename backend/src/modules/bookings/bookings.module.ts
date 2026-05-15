import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../prisma.service';
import { LensAvailabilityModule } from '../lens-availability/lens-availability.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [LensAvailabilityModule, WalletModule],
  controllers: [BookingsController],
  providers: [BookingsService, PrismaService],
  exports: [BookingsService],
})
export class BookingsModule {}
