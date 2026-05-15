import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

@Injectable()
export class WalletLedgerService {
  /**
   * Ghi một dòng sổ cái ví (append-only). Caller phải đảm bảo snapshot khớp với cập nhật Wallet vừa thực hiện.
   */
  append(
    tx: Tx,
    input: {
      wallet_id: string;
      booking_id?: string | null;
      booking_group_id?: string | null;
      reference_transaction_id?: string | null;
      payout_id?: string | null;
      bucket: 'AVAILABLE' | 'PENDING';
      direction: 'CREDIT' | 'DEBIT';
      amount: number;
      available_before: number;
      available_after: number;
      pending_before: number;
      pending_after: number;
      note?: string | null;
      idempotency_key?: string | null;
    },
  ) {
    return tx.walletTransaction.create({
      data: {
        wallet_id: input.wallet_id,
        booking_id: input.booking_id ?? undefined,
        booking_group_id: input.booking_group_id ?? undefined,
        reference_transaction_id: input.reference_transaction_id ?? undefined,
        payout_id: input.payout_id ?? undefined,
        bucket: input.bucket,
        direction: input.direction,
        amount: input.amount,
        available_before: input.available_before,
        available_after: input.available_after,
        pending_before: input.pending_before,
        pending_after: input.pending_after,
        note: input.note ?? undefined,
        idempotency_key: input.idempotency_key ?? undefined,
      },
    });
  }

  /** Bỏ qua nếu idempotency_key đã tồn tại (retry an toàn). */
  async appendIdempotent(tx: Tx, input: Parameters<WalletLedgerService['append']>[1]) {
    if (!input.idempotency_key) {
      return this.append(tx, input);
    }
    const exists = await tx.walletTransaction.findUnique({
      where: { idempotency_key: input.idempotency_key },
    });
    if (exists) return exists;
    return this.append(tx, input);
  }
}
