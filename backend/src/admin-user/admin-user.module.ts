import { Module } from '@nestjs/common';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { PrismaService } from '../prisma.service'; 

@Module({
  controllers: [AdminUserController],
  providers: [
    AdminUserService, 
    PrismaService 
  ],
})
export class AdminUserModule {}