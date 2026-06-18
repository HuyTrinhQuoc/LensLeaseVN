import { paymentService, type TopupChannel } from '../services/payment.service';

/** Tạo link cổng thanh toán nhóm đơn và chuyển hướng trình duyệt. */
export async function redirectBookingGroupPayment(
  groupId: string,
  channel: TopupChannel,
): Promise<void> {
  const res =
    channel === 'VNPAY'
      ? await paymentService.createBookingGroupVnpay(groupId)
      : await paymentService.createBookingGroupMomo(groupId);
  const url = res.data?.data?.paymentUrl;
  if (!url) {
    throw new Error('Không nhận được link thanh toán từ cổng.');
  }
  window.location.href = url;
}
