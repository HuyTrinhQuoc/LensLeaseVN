import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ValidateCheckoutItemDto {
  @ApiProperty({ description: 'ID sản phẩm cho thuê' })
  @IsUUID()
  lens_id!: string;

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  start_date!: string;

  @ApiProperty({ example: '2026-06-05' })
  @IsDateString()
  end_date!: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  quantity?: number;
}

export class ValidateCheckoutDto {
  @ApiProperty({ type: [ValidateCheckoutItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ValidateCheckoutItemDto)
  items!: ValidateCheckoutItemDto[];
}
