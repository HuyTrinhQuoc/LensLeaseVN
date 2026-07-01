import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { WalletLedgerService } from './wallet-ledger.service';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private readonly ledger: WalletLedgerService,
  ) {}

  /**
   * Lấy hoặc tạo ví cho user.
   */
  async getOrCreateWallet(userId: string) {
    return this.prisma.wallet.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        available_balance: 0,
        pending_balance: 0,
      },
      update: {},
    });
  }

  /**
   * Xem số dư ví.
   */
  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    return {
      wallet_id: wallet.id,
      available_balance: Number(wallet.available_balance),
      pending_balance: Number(wallet.pending_balance),
      total_balance:
        Number(wallet.available_balance) + Number(wallet.pending_balance),
    };
  }

  /**
   * Sổ cái ví (audit): biến động available/pending theo từng dòng.
   */
  async getLedger(userId: string, page = 1, limit = 30) {
    const wallet = await this.getOrCreateWallet(userId);
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { wallet_id: wallet.id },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          booking: { select: { id: true, status: true } },
          booking_group: { select: { id: true, status: true } },
        },
      }),
      this.prisma.walletTransaction.count({ where: { wallet_id: wallet.id } }),
    ]);

    const data = rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
      available_before: Number(r.available_before),
      available_after: Number(r.available_after),
      pending_before: Number(r.pending_before),
      pending_after: Number(r.pending_after),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lệnh rút tiền (Payout) của user.
   */
  async getPayouts(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.prisma.payout.findMany({
        where: { owner_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payout.count({ where: { owner_id: userId } }),
    ]);

    const data = rows.map((p) => ({
      ...p,
      amount: Number(p.amount),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lịch sử giao dịch ví.
   */
  async getTransactions(userId: string, page = 1, limit = 20, type?: string) {
    const where: any = { user_id: userId };
    if (type) where.type = type.toUpperCase();

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          booking: {
            select: {
              id: true,
              start_date: true,
              end_date: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const data = transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Yêu cầu rút tiền → chuyển từ available_balance → bank.
   */
  async requestWithdrawal(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Số tiền rút phải lớn hơn 0');
    }

    const wallet = await this.getOrCreateWallet(userId);

    if (Number(wallet.available_balance) < amount) {
      throw new BadRequestException(
        `Số dư không đủ. Khả dụng: ${wallet.available_balance} VNĐ`,
      );
    }

    // Kiểm tra bank_details
    const bankDetail = await this.prisma.bankDetail.findUnique({
      where: { user_id: userId },
    });

    if (!bankDetail || !bankDetail.bank_account) {
      throw new BadRequestException(
        'Vui lòng cập nhật thông tin ngân hàng trước khi rút tiền',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const walletBefore = await tx.wallet.findUnique({
        where: { user_id: userId },
      });
      if (!walletBefore || Number(walletBefore.available_balance) < amount) {
        throw new BadRequestException(
          `Số dư không đủ. Khả dụng: ${walletBefore?.available_balance ?? 0} VNĐ`,
        );
      }

      const payout = await tx.payout.create({
        data: {
          owner_id: userId,
          wallet_id: walletBefore.id,
          amount,
          status: 'PENDING',
          bank_name: bankDetail.bank_name,
          bank_account: bankDetail.bank_account,
          bank_owner_name: bankDetail.bank_owner,
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          user_id: userId,
          amount,
          type: 'PAYOUT',
          status: 'PENDING',
          payment_method: 'BANK_TRANSFER',
          description: `Rút tiền #${payout.id.slice(0, 8)} → ${bankDetail.bank_name} ${bankDetail.bank_account}`,
        },
      });

      await tx.wallet.update({
        where: { user_id: userId },
        data: {
          available_balance: { decrement: amount },
        },
      });

      const walletAfter = await tx.wallet.findUnique({
        where: { user_id: userId },
      });

      await this.ledger.appendIdempotent(tx, {
        wallet_id: walletBefore.id,
        payout_id: payout.id,
        reference_transaction_id: transaction.id,
        bucket: 'AVAILABLE',
        direction: 'DEBIT',
        amount,
        available_before: Number(walletBefore.available_balance),
        available_after: Number(walletAfter!.available_balance),
        pending_before: Number(walletBefore.pending_balance),
        pending_after: Number(walletAfter!.pending_balance),
        note: `Yêu cầu rút tiền (chờ duyệt)`,
        idempotency_key: `withdraw-${payout.id}`,
      });

      return { transaction, payout };
    });

    return {
      message: 'Yêu cầu rút tiền đã được ghi nhận',
      transaction: result.transaction,
      payout: result.payout,
      bank_info: {
        bank_name: bankDetail.bank_name,
        bank_account: bankDetail.bank_account,
        bank_owner: bankDetail.bank_owner,
      },
    };
  }

  /**
   * Thống kê ví (tổng thu, tổng chi, tổng hoa hồng).
   */
  async getWalletStats(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    // Tổng thu (PAYOUT thành công)
    const totalEarned = await this.prisma.transaction.aggregate({
      where: {
        user_id: userId,
        type: 'PAYOUT',
        status: 'SUCCESS',
      },
      _sum: { amount: true },
    });

    // Tổng phí sàn (COMMISSION)
    const totalCommission = await this.prisma.transaction.aggregate({
      where: {
        user_id: userId,
        type: 'COMMISSION',
        status: 'SUCCESS',
      },
      _sum: { amount: true },
    });

    // Tổng hoàn cọc (REFUND)
    const totalRefunded = await this.prisma.transaction.aggregate({
      where: {
        user_id: userId,
        type: 'REFUND',
        status: 'SUCCESS',
      },
      _sum: { amount: true },
    });

    return {
      available_balance: Number(wallet.available_balance),
      pending_balance: Number(wallet.pending_balance),
      total_earned: Number(totalEarned._sum.amount || 0),
      total_commission_paid: Number(totalCommission._sum.amount || 0),
      total_refunded: Number(totalRefunded._sum.amount || 0),
    };
  }

  /**
   * Nạp tiền vào ví (mô phỏng cổng / QA — không gọi VNPay/MoMo thật).
   */
  async depositSimulated(userId: string, amount: number, description?: string) {
    if (amount <= 0) {
      throw new BadRequestException('Số tiền nạp phải lớn hơn 0');
    }

    return this.prisma.$transaction(async (tx) => {
      const before = await tx.wallet.findUnique({
        where: { user_id: userId },
      });
      const a0 = before ? Number(before.available_balance) : 0;
      const p0 = before ? Number(before.pending_balance) : 0;

      await tx.wallet.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          available_balance: amount,
          pending_balance: 0,
        },
        update: {
          available_balance: { increment: amount },
        },
      });

      const after = await tx.wallet.findUnique({
        where: { user_id: userId },
      });
      if (!after) throw new BadRequestException('Không tạo được ví');

      const transaction = await tx.transaction.create({
        data: {
          user_id: userId,
          amount,
          type: 'DEPOSIT',
          status: 'SUCCESS',
          payment_method: 'MOMO',
          gateway_transaction_id: `TOPUP-${Date.now()}`,
          description:
            description?.trim() ||
            'Nạp tiền vào ví (mô phỏng — dùng cho dev / test thanh toán khi owner duyệt đơn)',
        },
      });

      await this.ledger.appendIdempotent(tx, {
        wallet_id: after.id,
        reference_transaction_id: transaction.id,
        bucket: 'AVAILABLE',
        direction: 'CREDIT',
        amount,
        available_before: a0,
        available_after: Number(after.available_balance),
        pending_before: p0,
        pending_after: Number(after.pending_balance),
        note: description?.trim() || 'Nạp tiền vào ví (mô phỏng)',
        idempotency_key: `deposit-${transaction.id}`,
      });

      return {
        message: 'Nạp tiền thành công',
        transaction: { ...transaction, amount: Number(transaction.amount) },
      };
    });
  }
}
