import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../prisma.service';
import { LensAvailabilityModule } from '../lens-availability/lens-availability.module';
import { WalletModule } from '../wallet/wallet.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { EkycModule } from '../ekyc/ekyc.module';

@Module({
  imports: [LensAvailabilityModule, WalletModule, PromotionsModule, EkycModule],
  controllers: [BookingsController],
  providers: [BookingsService, PrismaService],
  exports: [BookingsService],
})
export class BookingsModule {}
