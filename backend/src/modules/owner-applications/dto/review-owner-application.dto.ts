import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewOwnerApplicationDto {
  @ApiPropertyOptional({ example: 'Hồ sơ hợp lệ, đã liên hệ xác minh.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  admin_note?: string;
}
