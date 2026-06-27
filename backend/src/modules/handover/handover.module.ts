import { Module } from '@nestjs/common';
import { HandoverService } from './handover.service';
import { HandoverController } from './handover.controller';
import { PrismaService } from '../../prisma.service'; 

@Module({
  controllers: [HandoverController],
  providers: [HandoverService, PrismaService],
})
export class HandoverModule {}