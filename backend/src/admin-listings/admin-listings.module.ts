import { Module } from '@nestjs/common';
import { AdminListingsController } from './admin-listings.controller';
import { AdminListingsService } from './admin-listings.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AdminListingsController],
  providers: [AdminListingsService, PrismaService],
})
export class AdminListingsModule {}
