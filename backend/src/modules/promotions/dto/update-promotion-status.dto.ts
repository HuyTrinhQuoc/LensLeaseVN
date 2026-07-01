import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdatePromotionStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  is_active!: boolean;
}