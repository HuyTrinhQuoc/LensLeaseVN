import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiPropertyOptional({ description: 'Số lượng mới', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Ngày bắt đầu thuê mới', example: '2026-06-02' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'Ngày kết thúc thuê mới', example: '2026-06-07' })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}
