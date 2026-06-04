import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Conversation, Message } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy hoặc tạo conversation giữa renter và owner
   */
  async getOrCreateConversation(
    renterId: string,
    ownerId: string,
  ): Promise<Conversation> {
    // Tìm conversation đã tồn tại
    let conversation = await this.prisma.conversation.findUnique({
      where: {
        renter_id_owner_id: {
          renter_id: renterId,
          owner_id: ownerId,
        },
      },
    });

    // Nếu chưa tồn tại, tạo mới
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          renter_id: renterId,
          owner_id: ownerId,
        },
      });
    }

    return conversation;
  }

  /**
   * Lấy tất cả conversations của user (vai trò renter hoặc owner)
   */
  async getUserConversations(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ conversations: Conversation[]; total: number }> {
    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: {
          OR: [
            { renter_id: userId },
            { owner_id: userId },
          ],
        },
        include: {
          renter: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true,
            },
          },
          owner: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true,
            },
          },
        },
        orderBy: { updated_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.conversation.count({
        where: {
          OR: [
            { renter_id: userId },
            { owner_id: userId },
          ],
        },
      }),
    ]);

    return { conversations, total };
  }

  /**
   * Lấy chi tiết conversation
   */
  async getConversationById(
    conversationId: string,
    userId: string,
  ): Promise<Conversation | null> {
    // Kiểm tra xem user có phải là renter hoặc owner của conversation này không
    return this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { renter_id: userId },
          { owner_id: userId },
        ],
      },
      include: {
        renter: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
          },
        },
        owner: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Lấy tất cả messages trong conversation
   */
  async getConversationMessages(
    conversationId: string,
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<{ messages: Message[]; total: number }> {
    // Kiểm tra authorization
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { renter_id: userId },
          { owner_id: userId },
        ],
      },
    });

    if (!conversation) {
      throw new Error('Unauthorized: User is not part of this conversation');
    }

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversation_id: conversationId },
        include: {
          sender: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.message.count({
        where: { conversation_id: conversationId },
      }),
    ]);

    return { messages: messages.reverse(), total };
  }

  /**
   * Gửi tin nhắn
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<Message> {
    // Kiểm tra xem sender có phải là renter hoặc owner không
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { renter_id: senderId },
          { owner_id: senderId },
        ],
      },
    });

    if (!conversation) {
      throw new Error('Unauthorized: User cannot send message in this conversation');
    }

    // Tạo message
    const message = await this.prisma.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    // Cập nhật last_message của conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        last_message: content,
        last_message_at: new Date(),
      },
    });

    return message;
  }

  /**
   * Mark message as read
   */
  async markMessagesAsRead(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    // Chỉ mark messages từ người khác là read
    await this.prisma.message.updateMany({
      where: {
        conversation_id: conversationId,
        sender_id: { not: userId },
        is_read: false,
      },
      data: { is_read: true },
    });
  }
}
