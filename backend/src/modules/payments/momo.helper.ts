import * as crypto from 'crypto';

export function momoCreateSignature(secretKey: string, rawSignature: string): string {
  return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
}

/** Chuỗi ký khi tạo thanh toán (captureWallet) — theo mẫu MoMo Payment API v2 */
export function momoRawSignatureCreate(input: {
  accessKey: string;
  amount: string;
  extraData: string;
  ipnUrl: string;
  orderId: string;
  orderInfo: string;
  partnerCode: string;
  redirectUrl: string;
  requestId: string;
  requestType: string;
}): string {
  return (
    `accessKey=${input.accessKey}` +
    `&amount=${input.amount}` +
    `&extraData=${input.extraData}` +
    `&ipnUrl=${input.ipnUrl}` +
    `&orderId=${input.orderId}` +
    `&orderInfo=${input.orderInfo}` +
    `&partnerCode=${input.partnerCode}` +
    `&redirectUrl=${input.redirectUrl}` +
    `&requestId=${input.requestId}` +
    `&requestType=${input.requestType}`
  );
}

/** Xác thực callback/notify từ MoMo (trường signature trong JSON) */
export function momoRawSignatureNotify(input: {
  accessKey: string;
  amount: string;
  extraData: string;
  message: string;
  orderId: string;
  orderInfo: string;
  orderType: string;
  partnerCode: string;
  payType: string;
  requestId: string;
  responseTime: string;
  resultCode: number | string;
  transId: string;
}): string {
  return (
    `accessKey=${input.accessKey}` +
    `&amount=${input.amount}` +
    `&extraData=${input.extraData}` +
    `&message=${input.message}` +
    `&orderId=${input.orderId}` +
    `&orderInfo=${input.orderInfo}` +
    `&orderType=${input.orderType}` +
    `&partnerCode=${input.partnerCode}` +
    `&payType=${input.payType}` +
    `&requestId=${input.requestId}` +
    `&responseTime=${input.responseTime}` +
    `&resultCode=${input.resultCode}` +
    `&transId=${input.transId}`
  );
}
