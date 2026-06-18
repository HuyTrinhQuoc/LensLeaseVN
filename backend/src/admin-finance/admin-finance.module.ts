import { Module } from '@nestjs/common';
import { AdminFinanceController } from './admin-finance.controller';
import { AdminFinanceService } from './admin-finance.service';
import { PrismaService } from '../prisma.service';
import { WalletModule } from '../modules/wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [AdminFinanceController],
  providers: [AdminFinanceService, PrismaService],
})
export class AdminFinanceModule {}
