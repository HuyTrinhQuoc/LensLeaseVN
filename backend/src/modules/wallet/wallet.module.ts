import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletLedgerService } from './wallet-ledger.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, WalletLedgerService, PrismaService],
  exports: [WalletService, WalletLedgerService],
})
export class WalletModule {}
