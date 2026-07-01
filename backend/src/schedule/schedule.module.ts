import { Module } from '@nestjs/common';
import { DeviceScheduleService } from './schedule.service';
import { DeviceScheduleController } from './schedule.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DeviceScheduleController],
  providers: [DeviceScheduleService, PrismaService],
})
export class ScheduleModule {}
