import api from './api';

export type TopupChannel = 'VNPAY' | 'MOMO';

export const paymentService = {
  getGatewayConfig() {
    return api.get<{ message: string; data: { vnpay: boolean; momo: boolean } }>('/payments/config');
  },

  createWalletTopup(
    amount: number,
    channel: TopupChannel,
    opts?: { bankCode?: string },
  ) {
    const body: { amount: number; channel: TopupChannel; bankCode?: string } = { amount, channel };
    if (channel === 'VNPAY' && opts?.bankCode?.trim()) {
      body.bankCode = opts.bankCode.trim();
    }
    return api.post<{ message: string; data: { orderId: string; paymentUrl: string; channel: string } }>(
      '/payments/wallet-topup',
      body,
    );
  },

  /** VNPay cho BookingGroup: tiền vào ví + nhóm chuyển PAID (2a). */
  createBookingGroupVnpay(groupId: string, opts?: { bankCode?: string }) {
    const body: { bankCode?: string } = {};
    if (opts?.bankCode?.trim()) body.bankCode = opts.bankCode.trim();
    return api.post<{
      message: string;
      data: { paymentUrl: string; transactionId: string; amountVnd: number };
    }>(`/payments/booking-groups/${encodeURIComponent(groupId)}/vnpay`, body);
  },
};
