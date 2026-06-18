import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ListAvailablePromotionsDto {
  @ApiProperty({ example: 500000, description: 'Tổng tiền thuê (chưa gồm cọc)' })
  @IsNumber()
  @Min(0)
  sub_total: number;

  @ApiPropertyOptional({ type: [String], description: 'Danh sách lens_id trong đơn' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lens_ids?: string[];
}
