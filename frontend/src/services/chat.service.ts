import { supabase } from '../lib/supabase';
import api from './api';
import type { Conversation, Message } from '../type/chat.type';

export class ChatService {
  /**
   * Get or create a conversation between renter and owner
   * Call backend API which handles JWT authentication
   */
  static async getOrCreateConversation(
    ownerId: string,
  ): Promise<Conversation> {
    try {
      const response = await api.post('/chat/conversations', {
        owner_id: ownerId,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create conversation');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Error in getOrCreateConversation:', error);
      console.error('Backend error response:', error.response?.data);
      const backendMessage = error.response?.data?.message || error.message || 'Failed to create conversation';
      throw new Error(backendMessage);
    }
  }
static subscribeToConversations(
  userId: string,
  onConversationUpdate: (conversation: Conversation) => void,
) {

  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
      },
      (payload: any) => {
        onConversationUpdate(payload.new);
      },
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}
  /**
   * Get list of conversations for current user
   */
  static async getUserConversations(
    limit = 20,
    offset = 0,
  ): Promise<Conversation[]> {
    try {
      const response = await api.get('/chat/conversations', {
        params: { limit, offset },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch conversations');
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Error in getUserConversations:', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  static async getConversationById(conversationId: string): Promise<Conversation> {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch conversation');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error in getConversationById:', error);
      throw error;
    }
  }

  /**
   * Get messages in a conversation
   */
  static async getConversationMessages(
    conversationId: string,
    limit = 50,
    offset = 0,
  ): Promise<Message[]> {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
        params: { limit, offset },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch messages');
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Error in getConversationMessages:', error);
      throw error;
    }
  }

  /**
   * Send a message in a conversation
   */
  static async sendMessage(
    conversationId: string,
    content: string,
  ): Promise<Message> {
    try {
      const response = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        { content },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send message');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }


 
// ChatService.ts - Phiên bản Chuẩn
static subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: Message) => void,
): () => void {
  const channelName = `messages:${conversationId}`;

  supabase.removeChannel(supabase.channel(channelName));

  let isUnsubscribed = false;
  let pollInterval: NodeJS.Timeout | null = null;
  let lastMessageId = '';

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new as Message);
        lastMessageId = payload.new.id;
      }
    )
    .subscribe((status) => {
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        console.warn(`⚠️ Realtime failed (${status}). Starting polling fallback...`);
        
        if (!pollInterval) {
          pollInterval = setInterval(async () => {
            if (isUnsubscribed) return;
            
            try {
              const messages = await ChatService.getConversationMessages(
                conversationId,
                1,
                0
              );
              
              if (messages.length > 0 && messages[0].id !== lastMessageId) {
                onNewMessage(messages[0]);
                lastMessageId = messages[0].id;
              }
            } catch (error) {
              console.error('Polling error:', error);
            }
          }, 2000); // Poll every 2 seconds
        }
      }
    });

  return () => {
    isUnsubscribed = true;
    if (pollInterval) clearInterval(pollInterval);
    supabase.removeChannel(channel);
  };
}
  /**
   * Subscribe to conversation updates (last_message changes)
   */
  static subscribeToConversationUpdates(
    conversationId: string,
    onUpdate: (conversation: Conversation) => void,
  ) {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`,
        },
        (payload: any) => {
          onUpdate(payload.new);
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  /**
   * Subscribe to new conversations for user
   */
  static subscribeToNewConversations(
    userId: string,
    onNewConversation: (conversation: Conversation) => void,
  ) {
    const channel = supabase
      .channel(`conversations:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `renter_id=eq.${userId},owner_id=eq.${userId}`,
        },
        (payload: any) => {
          onNewConversation(payload.new);
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }
}
