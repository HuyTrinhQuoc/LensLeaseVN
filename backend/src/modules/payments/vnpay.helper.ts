import * as crypto from 'crypto';

/** vnp_Amount theo tài liệu VNPay: số tiền (VNĐ) × 100 */
export function vnpayAmountFromVnd(vnd: number): number {
  return Math.round(vnd) * 100;
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function vnpayCreateDate(d = new Date()): string {
  return (
    `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}` +
    `${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`
  );
}

export const VNPAY_LINK_EXPIRE_MINUTES = 15;

export function vnpayExpireDateMinutesFromNow(
  minutes = VNPAY_LINK_EXPIRE_MINUTES,
  d = new Date(),
): string {
  return vnpayCreateDate(new Date(d.getTime() + minutes * 60_000));
}

/** Mô tả tiếng Việt cho mã phản hồi VNPay (return / IPN). */
export function vnpayResponseMessage(code: string): string {
  const table: Record<string, string> = {
    '00': 'Giao dịch thành công',
    '07': 'Giao dịch bị nghi ngờ gian lận',
    '09': 'Thẻ/tài khoản chưa đăng ký Internet Banking',
    '10': 'Xác thực thẻ/tài khoản sai quá 3 lần',
    '11': 'Hết hạn chờ thanh toán — vui lòng thử lại',
    '12': 'Thẻ/tài khoản bị khóa',
    '13': 'Nhập sai mã OTP',
    '24': 'Bạn đã hủy giao dịch trên cổng VNPay',
    '51': 'Tài khoản không đủ số dư',
    '65': 'Vượt hạn mức giao dịch trong ngày',
    '75': 'Ngân hàng đang bảo trì',
    '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định',
    '99': 'Lỗi không xác định từ VNPay',
  };
  return table[code] || `VNPay từ chối (mã ${code})`;
}

/**
 * Giống Java URLEncoder (ASCII): dùng cho chuỗi ký HMAC — giữ '+' cho khoảng trắng
 * (VNPay / demo PHP; khác encodeURIComponent('%20') khi ký sẽ bị "Sai chữ ký").
 */
function vnpUrlEncodeForSign(v: string): string {
  return encodeURIComponent(v).replace(/%20/g, '+');
}

/** Chuỗi ký: các key vnp_* (trừ hash), sort, bỏ giá trị rỗng — khớp TreeMap + buildQueryString(..., false) của electro-store. */
export function buildVnpayHashStringFromParams(params: Record<string, string>): string {
  const keys = Object.keys(params)
    .filter((k) => k.startsWith('vnp_') && k !== 'vnp_SecureHash' && k !== 'vnp_SecureHashType')
    .filter((k) => params[k] != null && params[k] !== '')
    .sort();
  return keys.map((k) => `${vnpUrlEncodeForSign(k)}=${vnpUrlEncodeForSign(params[k])}`).join('&');
}

export function vnpaySecureHash(secret: string, signData: string): string {
  return crypto.createHmac('sha512', secret).update(signData, 'utf8').digest('hex');
}

export function vnpayVerify(secret: string, params: Record<string, string>): boolean {
  const secureHash = (params.vnp_SecureHash || params.vnp_Securehash || '').trim();
  if (!secureHash) return false;
  const signData = buildVnpayHashStringFromParams(params);
  const expected = vnpaySecureHash(secret, signData);
  const a = secureHash.toLowerCase();
  const b = expected.toLowerCase();
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
}

export function buildVnpayPayUrl(input: {
  paymentBaseUrl: string;
  tmnCode: string;
  secretKey: string;
  returnUrl: string;
  /** Không gửi lên VNPay — IPN khai báo trên Merchant Admin (tài liệu pay 2.1.0 không dùng vnp_IpnUrl trong URL pay). */
  ipnUrl?: string;
  txnRef: string;
  orderInfo: string;
  amountVnd: number;
  clientIp: string;
  bankCode?: string;
  locale?: string;
}): string {
  const locale = input.locale ?? 'vn';
  const vnp: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: input.tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: input.txnRef,
    vnp_OrderInfo: input.orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: String(vnpayAmountFromVnd(input.amountVnd)),
    vnp_ReturnUrl: input.returnUrl,
    vnp_CreateDate: vnpayCreateDate(),
    vnp_ExpireDate: vnpayExpireDateMinutesFromNow(VNPAY_LINK_EXPIRE_MINUTES),
    vnp_IpAddr: (input.clientIp || '127.0.0.1').trim() || '127.0.0.1',
  };
  if (input.bankCode?.trim()) {
    vnp.vnp_BankCode = input.bankCode.trim();
  }

  const signData = buildVnpayHashStringFromParams(vnp);
  const secureHash = vnpaySecureHash(input.secretKey, signData);
  const withHash: Record<string, string> = { ...vnp, vnp_SecureHash: secureHash };

  const keys = Object.keys(withHash).sort();
  const qs = keys
    .map((k) => {
      const ek = vnpUrlEncodeForSign(k).replace(/\+/g, '%20');
      const ev = vnpUrlEncodeForSign(withHash[k]).replace(/\+/g, '%20');
      return `${ek}=${ev}`;
    })
    .join('&');
  return `${input.paymentBaseUrl}?${qs}`;
}
