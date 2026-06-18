import { Module } from '@nestjs/common';
import { EkycController } from './ekyc.controller';
import { EkycService } from './ekyc.service';
import { PrismaService } from '../../prisma.service';
import { StorageModule } from '../../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [EkycController],
  providers: [EkycService, PrismaService],
  exports: [EkycService],
})
export class EkycModule {}
