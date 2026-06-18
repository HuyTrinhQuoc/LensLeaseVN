import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WalletLedgerService } from '../modules/wallet/wallet-ledger.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AdminFinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: WalletLedgerService,
  ) {}

  assertAdmin(headers: Record<string, string>) {
    const token =
      headers['authorization']?.replace('Bearer ', '') ||
      headers['x-user-id'];
    if (!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập');
    }

    if (token.split('.').length === 3) {
      try {
        const payload = jwt.verify(
          token,
          process.env.JWT_SECRET || 'lenslease_super_secret_key',
        ) as { userId?: string; role?: string };
        if (payload.role !== 'ADMIN') {
          throw new UnauthorizedException('Chỉ admin mới được truy cập');
        }
        return payload.userId as string;
      } catch (e) {
        if (e instanceof UnauthorizedException) throw e;
        throw new UnauthorizedException('Token không hợp lệ');
      }
    }

    throw new UnauthorizedException('Token không hợp lệ');
  }

  async getSummary() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [escrowAgg, commissionAll, commissionMonth, pendingPayouts] =
      await Promise.all([
        this.prisma.wallet.aggregate({ _sum: { pending_balance: true } }),
        this.prisma.transaction.aggregate({
          where: { type: 'COMMISSION', status: 'SUCCESS' },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            type: 'COMMISSION',
            status: 'SUCCESS',
            created_at: { gte: monthStart },
          },
          _sum: { amount: true },
        }),
        this.prisma.payout.aggregate({
          where: { status: { in: ['PENDING', 'PROCESSING'] } },
          _sum: { amount: true },
        }),
      ]);

    const escrowHeld = Number(escrowAgg._sum.pending_balance ?? 0);
    const totalCommission = Number(commissionAll._sum.amount ?? 0);
    const commissionThisMonth = Number(commissionMonth._sum.amount ?? 0);
    const pendingPayoutAmount = Number(pendingPayouts._sum.amount ?? 0);

    return {
      system_wallet_balance: totalCommission,
      commission_collected_all_time: totalCommission,
      commission_collected_this_month: commissionThisMonth,
      escrow_held: escrowHeld,
      pending_payout_amount: pendingPayoutAmount,
    };
  }

  async listPayouts(query: { status?: string; page?: number; limit?: number }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: { status?: { in: string[] } | string } = {};
    if (query.status) {
      const statuses = query.status.split(',').map((s) => s.trim().toUpperCase());
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    }

    const [rows, total] = await Promise.all([
      this.prisma.payout.findMany({
        where: where as any,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          owner: {
            select: { id: true, full_name: true, email: true },
          },
        },
      }),
      this.prisma.payout.count({ where: where as any }),
    ]);

    return {
      data: rows.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async approvePayout(adminId: string, payoutId: string, adminNote?: string) {
    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.payout.findUnique({ where: { id: payoutId } });
      if (!payout) {
        throw new NotFoundException('Không tìm thấy yêu cầu rút tiền');
      }
      if (!['PENDING', 'PROCESSING'].includes(payout.status)) {
        throw new BadRequestException(
          `Không thể duyệt yêu cầu ở trạng thái ${payout.status}`,
        );
      }

      const updated = await tx.payout.update({
        where: { id: payoutId },
        data: {
          status: 'COMPLETED',
          processed_at: new Date(),
          processed_by_id: adminId,
          admin_note: adminNote?.trim() || undefined,
        },
        include: {
          owner: { select: { id: true, full_name: true, email: true } },
        },
      });

      const ledgerLine = await tx.walletTransaction.findFirst({
        where: { payout_id: payoutId },
      });
      if (ledgerLine?.reference_transaction_id) {
        await tx.transaction.update({
          where: { id: ledgerLine.reference_transaction_id },
          data: { status: 'SUCCESS' },
        });
      }

      return { ...updated, amount: Number(updated.amount) };
    });
  }

  async rejectPayout(
    adminId: string,
    payoutId: string,
    rejectionReason: string,
  ) {
    const reason = rejectionReason?.trim();
    if (!reason) {
      throw new BadRequestException('Vui lòng nhập lý do từ chối');
    }

    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.payout.findUnique({ where: { id: payoutId } });
      if (!payout) {
        throw new NotFoundException('Không tìm thấy yêu cầu rút tiền');
      }
      if (payout.status !== 'PENDING') {
        throw new BadRequestException(
          `Chỉ từ chối được yêu cầu PENDING (hiện tại: ${payout.status})`,
        );
      }

      const amount = Number(payout.amount);
      const walletBefore = await tx.wallet.findUnique({
        where: { id: payout.wallet_id },
      });
      if (!walletBefore) {
        throw new NotFoundException('Không tìm thấy ví của chủ thuê');
      }

      await tx.wallet.update({
        where: { id: payout.wallet_id },
        data: { available_balance: { increment: amount } },
      });

      const walletAfter = await tx.wallet.findUnique({
        where: { id: payout.wallet_id },
      });

      const ledgerLine = await tx.walletTransaction.findFirst({
        where: { payout_id: payoutId },
      });

      if (ledgerLine?.reference_transaction_id) {
        await tx.transaction.update({
          where: { id: ledgerLine.reference_transaction_id },
          data: { status: 'CANCELLED' },
        });
      }

      await this.ledger.appendIdempotent(tx, {
        wallet_id: payout.wallet_id,
        payout_id: payoutId,
        reference_transaction_id: ledgerLine?.reference_transaction_id ?? null,
        bucket: 'AVAILABLE',
        direction: 'CREDIT',
        amount,
        available_before: Number(walletBefore.available_balance),
        available_after: Number(walletAfter!.available_balance),
        pending_before: Number(walletBefore.pending_balance),
        pending_after: Number(walletAfter!.pending_balance),
        note: `Hoàn tiền — từ chối rút tiền: ${reason}`,
        idempotency_key: `payout-reject-${payoutId}`,
      });

      const updated = await tx.payout.update({
        where: { id: payoutId },
        data: {
          status: 'REJECTED',
          rejection_reason: reason,
          processed_at: new Date(),
          processed_by_id: adminId,
        },
        include: {
          owner: { select: { id: true, full_name: true, email: true } },
        },
      });

      return { ...updated, amount: Number(updated.amount) };
    });
  }

  async getRecentTransactions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.prisma.transaction.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, full_name: true, email: true } },
          booking: { select: { id: true, status: true } },
        },
      }),
      this.prisma.transaction.count(),
    ]);

    return {
      data: rows.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
