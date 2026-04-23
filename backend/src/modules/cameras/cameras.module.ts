import { Module } from '@nestjs/common';
import { CamerasController } from './cameras.controller';
import { CamerasService } from './cameras.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [CamerasController],
  providers: [CamerasService, PrismaService],
  exports: [CamerasService],
})
export class CamerasModule {}
