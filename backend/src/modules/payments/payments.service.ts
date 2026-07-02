import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentMethod, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { WalletLedgerService } from '../wallet/wallet-ledger.service';
import { WalletTopupChannelDto } from './dto/create-wallet-topup.dto';
import { momoCreateSignature, momoRawSignatureCreate, momoRawSignatureNotify } from './momo.helper';
import {
  buildVnpayPayUrl,
  VNPAY_LINK_EXPIRE_MINUTES,
  vnpayAmountFromVnd,
  vnpayResponseMessage,
  vnpayVerify,
} from './vnpay.helper';

@Injectable()
export class PaymentsService {
  private readonly log = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly ledger: WalletLedgerService,
  ) {}

  private apiPublicUrl(): string {
    return (
      this.config.get<string>('API_PUBLIC_URL') ||
      `http://localhost:${this.config.get<string>('PORT') ?? '3000'}`
    ).replace(/\/$/, '');
  }

  appPublicUrl(): string {
    return (this.config.get<string>('PUBLIC_APP_URL') || 'http://localhost:5173').replace(/\/$/, '');
  }

  buildWalletTopupResultRedirect(ok: boolean, gateway: string, message?: string): string {
    const u = new URL(`${this.appPublicUrl()}/wallet/topup/result`);
    u.searchParams.set('gateway', gateway);
    u.searchParams.set('ok', ok ? '1' : '0');
    if (message) u.searchParams.set('msg', message.slice(0, 240));
    return u.toString();
  }

  /** Sau cổng thanh toán cho BookingGroup — tiền đã vào ví, đánh dấu nhóm PAID. */
  buildBookingGroupPayResultRedirect(
    ok: boolean,
    groupId: string,
    gateway: 'vnpay' | 'momo' = 'vnpay',
    message?: string,
  ): string {
    const u = new URL(`${this.appPublicUrl()}/bookings/payment-result`);
    u.searchParams.set('gateway', gateway);
    u.searchParams.set('ok', ok ? '1' : '0');
    u.searchParams.set('groupId', groupId);
    if (message) u.searchParams.set('msg', message.slice(0, 240));
    return u.toString();
  }

  gatewayConfig() {
    const vnpay =
      !!this.config.get<string>('VNPAY_TMN_CODE')?.trim() &&
      !!this.config.get<string>('VNPAY_HASH_SECRET')?.trim();
    const momo =
      !!this.config.get<string>('MOMO_PARTNER_CODE')?.trim() &&
      !!this.config.get<string>('MOMO_ACCESS_KEY')?.trim() &&
      !!this.config.get<string>('MOMO_SECRET_KEY')?.trim();
    return { vnpay, momo };
  }

  async createWalletTopup(
    userId: string,
    amount: number,
    channel: WalletTopupChannelDto,
    clientIp?: string,
    vnpayBankCode?: string,
  ) {
    if (amount < 10000) {
      throw new BadRequestException('Số tiền tối thiểu 10.000đ');
    }

    const pending = await this.prisma.transaction.create({
      data: {
        user_id: userId,
        amount: new Prisma.Decimal(amount),
        type: 'DEPOSIT',
        status: 'PENDING',
        payment_method: channel === WalletTopupChannelDto.VNPAY ? PaymentMethod.VNPAY : PaymentMethod.MOMO,
        description: `Nạp ví — ${channel} — chờ cổng thanh toán`,
      },
    });

    const orderId = pending.id;

    if (channel === WalletTopupChannelDto.VNPAY) {
      const tmn = this.config.get<string>('VNPAY_TMN_CODE')?.trim();
      const secret = this.config.get<string>('VNPAY_HASH_SECRET')?.trim();
      const payUrlBase =
        this.config.get<string>('VNPAY_PAYMENT_URL')?.trim() ||
        'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
      if (!tmn || !secret) {
        await this.prisma.transaction.update({
          where: { id: orderId },
          data: { status: 'FAILED', description: 'VNPay chưa cấu hình (.env)' },
        });
        throw new BadRequestException('VNPay chưa được cấu hình (VNPAY_TMN_CODE, VNPAY_HASH_SECRET).');
      }
      const base = this.apiPublicUrl();
      const returnUrl = `${base}/payments/wallet-topup/vnpay/return`;
      const paymentUrl = buildVnpayPayUrl({
        paymentBaseUrl: payUrlBase,
        tmnCode: tmn,
        secretKey: secret,
        returnUrl,
        txnRef: orderId,
        orderInfo: `Nap vi LensLease ${orderId.slice(0, 8)}`,
        amountVnd: amount,
        clientIp: clientIp?.trim() || '127.0.0.1',
        bankCode: vnpayBankCode?.trim() || undefined,
      });
      return { orderId, paymentUrl, channel: 'VNPAY' as const };
    }

    const partner = this.config.get<string>('MOMO_PARTNER_CODE')?.trim();
    const access = this.config.get<string>('MOMO_ACCESS_KEY')?.trim();
    const secret = this.config.get<string>('MOMO_SECRET_KEY')?.trim();
    const endpoint =
      this.config.get<string>('MOMO_ENDPOINT')?.trim() ||
      'https://test-payment.momo.vn/v2/gateway/api/create';
    if (!partner || !access || !secret) {
      await this.prisma.transaction.update({
        where: { id: orderId },
        data: { status: 'FAILED', description: 'MoMo chưa cấu hình (.env)' },
      });
      throw new BadRequestException(
        'MoMo chưa được cấu hình (MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY).',
      );
    }

    const base = this.apiPublicUrl();
    const redirectUrl = `${base}/payments/wallet-topup/momo/return`;
    const ipnUrl = `${base}/payments/wallet-topup/momo/notify`;
    const requestId = `${Date.now()}-${orderId.slice(0, 8)}`;
    const orderIdMomo = orderId.replace(/-/g, '').slice(0, 40);
    const extraData = '';
    const requestType = 'captureWallet';
    const orderInfo = 'Nap vi LensLease';
    const raw = momoRawSignatureCreate({
      accessKey: access,
      amount: String(Math.round(amount)),
      extraData,
      ipnUrl,
      orderId: orderIdMomo,
      orderInfo,
      partnerCode: partner,
      redirectUrl,
      requestId,
      requestType,
    });
    const signature = momoCreateSignature(secret, raw);

    const body = {
      partnerCode: partner,
      partnerName: 'LensLeaseVN',
      storeId: 'LensLeaseStore',
      requestId,
      amount: Math.round(amount),
      orderId: orderIdMomo,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      requestType,
      extraData,
      signature,
    };

    let payUrl: string;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        resultCode?: number;
        message?: string;
        payUrl?: string;
      };
      if (json.resultCode !== 0 || !json.payUrl) {
        this.log.warn(`MoMo create failed: ${JSON.stringify(json)}`);
        await this.prisma.transaction.update({
          where: { id: orderId },
          data: {
            status: 'FAILED',
            description: `MoMo từ chối: ${json.message ?? json.resultCode}`,
          },
        });
        throw new BadRequestException(json.message || 'MoMo không tạo được link thanh toán.');
      }
      payUrl = json.payUrl;
      await this.prisma.transaction.update({
        where: { id: orderId },
        data: { gateway_transaction_id: orderIdMomo },
      });
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      this.log.error(`MoMo fetch error: ${(e as Error).message}`);
      await this.prisma.transaction.update({
        where: { id: orderId },
        data: { status: 'FAILED', description: 'Lỗi gọi API MoMo' },
      });
      throw new InternalServerErrorException('Không kết nối được MoMo.');
    }

    return { orderId, paymentUrl: payUrl, channel: 'MOMO' as const, momoOrderId: orderIdMomo };
  }

  async finalizeTopupSuccess(
    internalTxId: string,
    gatewayRef: string,
    method: PaymentMethod,
    idempotencySuffix: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const row = await tx.transaction.findUnique({ where: { id: internalTxId } });
      if (!row || row.type !== 'DEPOSIT') {
        throw new BadRequestException('Giao dịch không hợp lệ');
      }
      if (row.status === 'SUCCESS') {
        return;
      }
      if (row.status !== 'PENDING') {
        throw new BadRequestException('Giao dịch không còn ở trạng thái chờ thanh toán');
      }

      const amount = Number(row.amount);
      const userId = row.user_id;

      const before = await tx.wallet.findUnique({ where: { user_id: userId } });
      const a0 = before ? Number(before.available_balance) : 0;
      const p0 = before ? Number(before.pending_balance) : 0;

      await tx.wallet.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          available_balance: amount,
          pending_balance: 0,
        },
        update: { available_balance: { increment: amount } },
      });

      const after = await tx.wallet.findUnique({ where: { user_id: userId } });
      if (!after) throw new InternalServerErrorException('Wallet error');

      await tx.transaction.update({
        where: { id: internalTxId },
        data: {
          status: 'SUCCESS',
          gateway_transaction_id: gatewayRef,
          payment_method: method,
          description: row.booking_group_id
            ? `VNPay đặt nhóm — đã vào ví (${method})`
            : `Nạp ví thành công (${method})`,
        },
      });

      await this.ledger.appendIdempotent(tx, {
        wallet_id: after.id,
        booking_group_id: row.booking_group_id ?? undefined,
        reference_transaction_id: internalTxId,
        bucket: 'AVAILABLE',
        direction: 'CREDIT',
        amount,
        available_before: a0,
        available_after: Number(after.available_balance),
        pending_before: p0,
        pending_after: Number(after.pending_balance),
        note: row.booking_group_id
          ? `Tiền VNPay đặt nhóm vào ví (${method})`
          : `Nạp ví cổng ${method}`,
        idempotency_key: `gateway-topup-${internalTxId}-${idempotencySuffix}`,
      });

      if (row.booking_group_id) {
        const g = await tx.bookingGroup.findFirst({
          where: { id: row.booking_group_id, user_id: row.user_id },
        });
        if (g?.status === 'PENDING') {
          await tx.bookingGroup.update({
            where: { id: row.booking_group_id },
            data: {
              status: 'PAID',
              payment_method: method,
              gateway_transaction_id: gatewayRef,
            },
          });
        }
      }
    });
  }

  /** Tổng VNĐ cần có trên ví khi các chủ duyệt (khớp `chargeRenterOnConfirm`). */
  computeBookingGroupPrepayVnd(
    bookings: Array<{
      total_price: unknown;
      deposit_amount: unknown | null;
      selected_deposit_type: unknown;
    }>,
  ): number {
    let sum = 0;
    for (const b of bookings) {
      sum += Number(b.total_price);
      if (b.selected_deposit_type === 'MONEY_PLATFORM' && b.deposit_amount != null) {
        sum += Number(b.deposit_amount);
      }
    }
    return Math.round(sum);
  }

  /** Chuẩn bị giao dịch PENDING cho thanh toán trước nhóm đơn (VNPay / MoMo). */
  private async prepareBookingGroupPrepay(
    userId: string,
    groupId: string,
    paymentMethod: PaymentMethod,
    pendingDescription: string,
  ): Promise<{ amountVnd: number; pendingTxId: string }> {
    const group = await this.prisma.bookingGroup.findFirst({
      where: { id: groupId, user_id: userId },
      include: {
        bookings: {
          select: { total_price: true, deposit_amount: true, selected_deposit_type: true },
        },
      },
    });
    if (!group) {
      throw new NotFoundException('Không tìm thấy nhóm đơn hoặc không thuộc về bạn.');
    }
    if (group.status !== 'PENDING') {
      throw new BadRequestException('Nhóm đơn không còn ở trạng thái chờ thanh toán online.');
    }

    const amountVnd = this.computeBookingGroupPrepayVnd(group.bookings);
    if (amountVnd < 10000) {
      throw new BadRequestException('Số tiền thanh toán nhỏ hơn mức tối thiểu (10.000đ).');
    }

    const dup = await this.prisma.transaction.findFirst({
      where: {
        booking_group_id: groupId,
        user_id: userId,
        status: 'PENDING',
        type: 'DEPOSIT',
      },
      orderBy: { created_at: 'desc' },
    });
    if (dup) {
      const ageMs = Date.now() - dup.created_at.getTime();
      const expired = ageMs > VNPAY_LINK_EXPIRE_MINUTES * 60_000;
      const amountChanged = Number(dup.amount) !== amountVnd;

      if (expired || amountChanged) {
        await this.prisma.transaction.update({
          where: { id: dup.id },
          data: {
            status: 'FAILED',
            description: expired
              ? 'Link VNPay hết hạn — có thể tạo link thanh toán mới'
              : 'Số tiền đơn thay đổi — hủy link VNPay cũ',
          },
        });
      } else {
        // Link còn hiệu lực: tái dùng cùng txnRef, chỉ tạo URL mới (vnp_CreateDate mới).
        return { amountVnd, pendingTxId: dup.id };
      }
    }

    if (Number(group.total_amount) !== amountVnd) {
      await this.prisma.bookingGroup.update({
        where: { id: groupId },
        data: { total_amount: new Prisma.Decimal(amountVnd) },
      });
    }

    const pending = await this.prisma.transaction.create({
      data: {
        user_id: userId,
        booking_group_id: groupId,
        amount: new Prisma.Decimal(amountVnd),
        type: 'DEPOSIT',
        status: 'PENDING',
        payment_method: paymentMethod,
        description: pendingDescription,
      },
    });

    return { amountVnd, pendingTxId: pending.id };
  }

  async createBookingGroupVnpayCheckout(
    userId: string,
    groupId: string,
    clientIp?: string,
    vnpayBankCode?: string,
  ): Promise<{ paymentUrl: string; transactionId: string; amountVnd: number }> {
    const tmn = this.config.get<string>('VNPAY_TMN_CODE')?.trim();
    const secret = this.config.get<string>('VNPAY_HASH_SECRET')?.trim();
    const payUrlBase =
      this.config.get<string>('VNPAY_PAYMENT_URL')?.trim() ||
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    if (!tmn || !secret) {
      throw new BadRequestException('VNPay chưa được cấu hình (VNPAY_TMN_CODE, VNPAY_HASH_SECRET).');
    }

    const { amountVnd, pendingTxId } = await this.prepareBookingGroupPrepay(
      userId,
      groupId,
      PaymentMethod.VNPAY,
      `VNPay đặt nhóm thuê — chờ cổng (${groupId.slice(0, 8)})`,
    );

    const base = this.apiPublicUrl();
    const returnUrl = `${base}/payments/booking-groups/vnpay/return`;
    const paymentUrl = buildVnpayPayUrl({
      paymentBaseUrl: payUrlBase,
      tmnCode: tmn,
      secretKey: secret,
      returnUrl,
      txnRef: pendingTxId,
      orderInfo: `Dat nhom thue ${groupId.slice(0, 8)}`,
      amountVnd,
      clientIp: clientIp?.trim() || '127.0.0.1',
      bankCode: vnpayBankCode?.trim() || undefined,
    });

    return { paymentUrl, transactionId: pendingTxId, amountVnd };
  }

  async createBookingGroupMomoCheckout(
    userId: string,
    groupId: string,
  ): Promise<{ paymentUrl: string; transactionId: string; amountVnd: number }> {
    const partner = this.config.get<string>('MOMO_PARTNER_CODE')?.trim();
    const access = this.config.get<string>('MOMO_ACCESS_KEY')?.trim();
    const secret = this.config.get<string>('MOMO_SECRET_KEY')?.trim();
    const endpoint =
      this.config.get<string>('MOMO_ENDPOINT')?.trim() ||
      'https://test-payment.momo.vn/v2/gateway/api/create';
    if (!partner || !access || !secret) {
      throw new BadRequestException(
        'MoMo chưa được cấu hình (MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY).',
      );
    }

    const { amountVnd, pendingTxId } = await this.prepareBookingGroupPrepay(
      userId,
      groupId,
      PaymentMethod.MOMO,
      `MoMo đặt nhóm thuê — chờ cổng (${groupId.slice(0, 8)})`,
    );

    const base = this.apiPublicUrl();
    const redirectUrl = `${base}/payments/booking-groups/momo/return`;
    const ipnUrl = `${base}/payments/booking-groups/momo/notify`;
    const requestId = `${Date.now()}-${pendingTxId.slice(0, 8)}`;
    const orderIdMomo = pendingTxId.replace(/-/g, '').slice(0, 40);
    const extraData = '';
    const requestType = 'captureWallet';
    const orderInfo = `Dat nhom thue ${groupId.slice(0, 8)}`;
    const raw = momoRawSignatureCreate({
      accessKey: access,
      amount: String(amountVnd),
      extraData,
      ipnUrl,
      orderId: orderIdMomo,
      orderInfo,
      partnerCode: partner,
      redirectUrl,
      requestId,
      requestType,
    });
    const signature = momoCreateSignature(secret, raw);

    const body = {
      partnerCode: partner,
      partnerName: 'LensLeaseVN',
      storeId: 'LensLeaseStore',
      requestId,
      amount: amountVnd,
      orderId: orderIdMomo,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      requestType,
      extraData,
      signature,
    };

    let payUrl: string;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        resultCode?: number;
        message?: string;
        payUrl?: string;
      };
      if (json.resultCode !== 0 || !json.payUrl) {
        this.log.warn(`MoMo booking group create failed: ${JSON.stringify(json)}`);
        await this.prisma.transaction.update({
          where: { id: pendingTxId },
          data: {
            status: 'FAILED',
            description: `MoMo từ chối: ${json.message ?? json.resultCode}`,
          },
        });
        throw new BadRequestException(json.message || 'MoMo không tạo được link thanh toán.');
      }
      payUrl = json.payUrl;
      await this.prisma.transaction.update({
        where: { id: pendingTxId },
        data: { gateway_transaction_id: orderIdMomo },
      });
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      this.log.error(`MoMo booking group fetch error: ${(e as Error).message}`);
      await this.prisma.transaction.update({
        where: { id: pendingTxId },
        data: { status: 'FAILED', description: 'Lỗi gọi API MoMo' },
      });
      throw new InternalServerErrorException('Không kết nối được MoMo.');
    }

    return { paymentUrl: payUrl, transactionId: pendingTxId, amountVnd };
  }

  async handleVnpayIpnOrReturn(query: Record<string, string | string[] | undefined>) {
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue;
      flat[k] = Array.isArray(v) ? v[0] : v;
    }
    const secret = this.config.get<string>('VNPAY_HASH_SECRET')?.trim();
    if (!secret) {
      return { ok: false as const, message: 'VNPay chưa cấu hình', bookingGroupId: undefined as string | undefined };
    }
    if (!vnpayVerify(secret, flat)) {
      return { ok: false as const, message: 'Sai chữ ký VNPay', bookingGroupId: undefined as string | undefined };
    }
    const txnRef = flat.vnp_TxnRef;
    const rsp = flat.vnp_ResponseCode;
    const txnStatus = flat.vnp_TransactionStatus;
    const amountVnp = flat.vnp_Amount ? Number(flat.vnp_Amount) : 0;
    if (!txnRef) {
      return { ok: false as const, message: 'Thiếu vnp_TxnRef', bookingGroupId: undefined as string | undefined };
    }

    const row = await this.prisma.transaction.findUnique({ where: { id: txnRef } });
    const bookingGroupId = row?.booking_group_id ?? undefined;
    if (!row || row.type !== 'DEPOSIT') {
      return { ok: false as const, message: 'Không tìm thấy giao dịch', bookingGroupId };
    }
    const expectedAmount = vnpayAmountFromVnd(Number(row.amount));
    if (amountVnp !== expectedAmount) {
      this.log.warn(`VNPay amount mismatch tx=${txnRef} got=${amountVnp} want=${expectedAmount}`);
      return { ok: false as const, message: 'Số tiền không khớp', bookingGroupId };
    }
    const paidOk =
      rsp === '00' && (!txnStatus || txnStatus === '00');
    if (!paidOk) {
      const reason = vnpayResponseMessage(rsp || '99');
      if (row.status === 'PENDING') {
        await this.prisma.transaction.update({
          where: { id: txnRef },
          data: {
            status: 'FAILED',
            description: `${reason}${txnStatus && txnStatus !== '00' ? ` (trạng thái ${txnStatus})` : ''}`,
          },
        });
      }
      return { ok: false as const, message: reason, bookingGroupId };
    }

    const gatewayRef = flat.vnp_TransactionNo || txnRef;
    await this.finalizeTopupSuccess(txnRef, gatewayRef, PaymentMethod.VNPAY, 'vnpay');
    return {
      ok: true as const,
      message: 'success',
      orderId: txnRef,
      bookingGroupId,
    };
  }

  async handleMomoNotify(body: Record<string, unknown>) {
    const access = this.config.get<string>('MOMO_ACCESS_KEY')?.trim();
    const secret = this.config.get<string>('MOMO_SECRET_KEY')?.trim();
    const partner = this.config.get<string>('MOMO_PARTNER_CODE')?.trim();
    if (!access || !secret || !partner) {
      return { resultCode: 1001, message: 'Server chưa cấu hình MoMo' };
    }

    const signature = String(body.signature ?? '');
    const orderId = String(body.orderId ?? '');
    const requestId = String(body.requestId ?? '');
    const amount = String(body.amount ?? '');
    const orderInfo = String(body.orderInfo ?? '');
    const orderType = String(body.orderType ?? '');
    const transId = String(body.transId ?? '');
    const resultCode = Number(body.resultCode ?? -1);
    const message = String(body.message ?? '');
    const payType = String(body.payType ?? '');
    const responseTime = String(body.responseTime ?? '');
    const extraData = String(body.extraData ?? '');

    const raw = momoRawSignatureNotify({
      accessKey: access,
      amount,
      extraData,
      message,
      orderId,
      orderInfo,
      orderType,
      partnerCode: partner,
      payType,
      requestId,
      responseTime,
      resultCode,
      transId,
    });
    const expected = momoCreateSignature(secret, raw);
    if (
      signature.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
      this.log.warn('MoMo notify: signature mismatch');
      return { resultCode: 1003, message: 'Invalid signature' };
    }

    const byMomoId = await this.prisma.transaction.findFirst({
      where: { gateway_transaction_id: orderId },
    });
    const internalId = byMomoId?.id;
    if (!internalId) {
      this.log.warn(`MoMo notify: unknown orderId=${orderId}`);
      return { resultCode: 1002, message: 'Unknown order' };
    }

    if (resultCode === 0) {
      await this.finalizeTopupSuccess(internalId, transId || orderId, PaymentMethod.MOMO, 'momo');
      return { resultCode: 0, message: 'Success' };
    }
    const row = await this.prisma.transaction.findUnique({ where: { id: internalId } });
    if (row?.status === 'PENDING') {
      await this.prisma.transaction.update({
        where: { id: internalId },
        data: { status: 'FAILED', description: `MoMo thất bại: ${message} (${resultCode})` },
      });
    }
    return { resultCode: 0, message: 'Acknowledged' };
  }

  async handleMomoReturn(query: Record<string, string | string[] | undefined>) {
    const resultCode = Number(Array.isArray(query.resultCode) ? query.resultCode[0] : query.resultCode ?? -1);
    const orderId = String(Array.isArray(query.orderId) ? query.orderId[0] : query.orderId ?? '');
    const transId = String(Array.isArray(query.transId) ? query.transId[0] : query.transId ?? '');
    const row = await this.prisma.transaction.findFirst({
      where: { gateway_transaction_id: orderId },
    });
    if (resultCode === 0 && row?.id) {
      try {
        await this.finalizeTopupSuccess(row.id, transId || orderId, PaymentMethod.MOMO, 'momo-return');
      } catch (e) {
        this.log.warn(`MoMo return finalize: ${(e as Error).message}`);
      }
    }
    return {
      ok: resultCode === 0,
      orderId: row?.id,
      bookingGroupId: row?.booking_group_id ?? undefined,
    };
  }
}
