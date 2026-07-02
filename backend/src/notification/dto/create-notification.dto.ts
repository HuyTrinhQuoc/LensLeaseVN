// create-notification.dto.ts
import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsUUID()
  userId!: string; // ID của User, Owner, hoặc Admin nhận thông báo

  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsOptional()
  @IsUUID()
  referenceId?: string; // Ví dụ: booking_id, message_id
}