import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ description: 'ID sản phẩm (lens_listing)', example: 'uuid-xxx' })
  @IsUUID()
  @IsNotEmpty()
  lens_id: string;

  @ApiProperty({ description: 'Số lượng', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Ngày bắt đầu thuê', example: '2026-06-01' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ description: 'Ngày kết thúc thuê', example: '2026-06-05' })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;
}
