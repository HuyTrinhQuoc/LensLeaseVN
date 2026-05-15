import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ExtendBookingDto {
  @ApiPropertyOptional({ description: 'Ngày kết thúc mới (gia hạn)', example: '2026-06-10' })
  @IsDateString()
  requested_end_date: string;

  @ApiPropertyOptional({ description: 'Lý do gia hạn' })
  @IsOptional()
  @IsString()
  reason?: string;
}
