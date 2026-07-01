export type NotificationType = 
  | 'SYSTEM' 
  | 'BOOKING' 
  | 'MESSAGE' 
  | 'PROMOTION'
  | 'KYC_REQUEST' // Yêu cầu duyệt CCCD
  | 'DISPUTE'     // Tranh chấp
  | 'PAYOUT_REQUEST'; // Yêu cầu rút tiền

export interface AppNotification {
  id: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  type: NotificationType;
  reference_id: string | null;
}