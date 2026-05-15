import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateBookingDto } from './create-booking.dto';

export class CheckoutGroupDto {
  @ApiProperty({ type: [CreateBookingDto], description: 'Danh sách từng đơn con (mỗi lens một dòng)' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBookingDto)
  items: CreateBookingDto[];

  @ApiPropertyOptional({
    description: 'ID cart_item cần xóa sau checkout (khớp với giỏ hiện tại)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  cart_item_ids?: string[];
}
