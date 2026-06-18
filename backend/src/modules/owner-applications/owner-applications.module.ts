import { Module } from '@nestjs/common';
import { OwnerApplicationsController } from './owner-applications.controller';
import { OwnerApplicationsService } from './owner-applications.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [OwnerApplicationsController],
  providers: [OwnerApplicationsService, PrismaService],
  exports: [OwnerApplicationsService],
})
export class OwnerApplicationsModule {}
