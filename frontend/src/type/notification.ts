export type NotificationType = 'SYSTEM' | 'BOOKING' | 'MESSAGE' | 'PROMOTION';

export type UserRole = 'USER' | 'OWNER' | 'ADMIN';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_read: boolean;
  type: NotificationType;
  reference_id?: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  data: Notification[];
}