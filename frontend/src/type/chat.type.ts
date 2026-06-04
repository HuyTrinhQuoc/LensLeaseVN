export interface Conversation {
  id: string;
  renter_id: string;
  owner_id: string;
  last_message?: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  renter?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    email?: string;
  };
  owner?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    email?: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment_url?: string | null;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface ChatUser {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  is_online?: boolean;
}
