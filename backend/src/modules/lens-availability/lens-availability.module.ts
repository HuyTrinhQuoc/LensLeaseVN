import { Module } from '@nestjs/common';
import { LensAvailabilityService } from './lens-availability.service';
import { PrismaService } from '../../prisma.service';

@Module({
  providers: [LensAvailabilityService, PrismaService],
  exports: [LensAvailabilityService],
})
export class LensAvailabilityModule {}
