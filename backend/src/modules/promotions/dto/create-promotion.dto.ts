import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromotionType } from '@prisma/client';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ example: 'SUMMER10' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  code!: string;

  @ApiProperty({ enum: PromotionType, example: PromotionType.PERCENTAGE })
  @IsEnum(PromotionType)
  discount_type!: PromotionType;

  @ApiProperty({ example: 10, description: 'Phần trăm hoặc số tiền giảm' })
  @IsNumber()
  @Min(0)
  discount_value!: number;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_order_value?: number;

  @ApiPropertyOptional({ example: 200000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_discount_amount?: number;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  @IsDateString()
  start_date!: string;

  @ApiProperty({ example: '2026-07-31T23:59:59.000Z' })
  @IsDateString()
  end_date!: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  usage_limit?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'Danh sách lens áp dụng. Owner voucher bắt buộc chọn ít nhất 1 lens.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  applicable_lens_ids?: string[];
}