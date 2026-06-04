import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from '../../auth/strategies/jwt.guard';

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  /**
   * POST /chat/conversations
   * Lấy hoặc tạo conversation giữa 2 users
   */
  @Post('conversations')
  async getOrCreateConversation(
    @Request() req: any,
    @Body() body: { owner_id: string },
  ) {
    try {
      const renterId = req.user.id;
      const { owner_id } = body;

      if (!owner_id) {
        throw new BadRequestException('owner_id is required');
      }

      if (renterId === owner_id) {
        throw new BadRequestException('Cannot create conversation with yourself');
      }

      const conversation = await this.chatService.getOrCreateConversation(
        renterId,
        owner_id,
      );

      return {
        success: true,
        data: conversation,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * GET /chat/conversations
   * Lấy danh sách conversations của user
   */
  @Get('conversations')
  async getUserConversations(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      const userId = req.user.id;
      const _limit = parseInt(limit || '20', 10);
      const _offset = parseInt(offset || '0', 10);

      const { conversations, total } =
        await this.chatService.getUserConversations(userId, _limit, _offset);

      return {
        success: true,
        data: conversations,
        total,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * GET /chat/conversations/:id
   * Lấy chi tiết conversation
   */
  @Get('conversations/:id')
  async getConversationById(
    @Request() req: any,
    @Param('id') conversationId: string,
  ) {
    try {
      const userId = req.user.id;
      const conversation = await this.chatService.getConversationById(
        conversationId,
        userId,
      );

      if (!conversation) {
        throw new NotFoundException(
          'Conversation not found or unauthorized',
        );
      }

      return {
        success: true,
        data: conversation,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  /**
   * GET /chat/conversations/:id/messages
   * Lấy danh sách messages trong conversation
   */
  @Get('conversations/:id/messages')
  async getConversationMessages(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      const userId = req.user.id;
      const _limit = parseInt(limit || '50', 10);
      const _offset = parseInt(offset || '0', 10);

      const { messages, total } =
        await this.chatService.getConversationMessages(
          conversationId,
          userId,
          _limit,
          _offset,
        );

      // Mark messages as read
      await this.chatService.markMessagesAsRead(conversationId, userId);

      return {
        success: true,
        data: messages,
        total,
      };
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  /**
   * POST /chat/conversations/:id/messages
   * Gửi tin nhắn trong conversation
   */
  @Post('conversations/:id/messages')
  async sendMessage(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Body() body: { content: string },
  ) {
    try {
      const senderId = req.user.id;
      const { content } = body;

      if (!content || content.trim().length === 0) {
        throw new BadRequestException('Message content cannot be empty');
      }

      const message = await this.chatService.sendMessage(
        conversationId,
        senderId,
        content.trim(),
      );

      return {
        success: true,
        data: message,
      };
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}
