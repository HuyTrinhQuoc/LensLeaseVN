/**
 * Format số tiền sang định dạng tiền tệ Việt Nam.
 * Ví dụ: 1500000 → "1.500.000đ"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

/**
 * Format ngày tháng sang định dạng dd/MM/yyyy.
 * Ví dụ: "2024-05-15" → "15/05/2024"
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format ngày giờ đầy đủ.
 * Ví dụ: "15 tháng 05, 2024 - 09:30"
 */
export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Rút gọn chuỗi dài.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}
