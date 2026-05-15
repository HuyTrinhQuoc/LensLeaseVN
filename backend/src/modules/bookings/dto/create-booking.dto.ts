import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { DeliveryMethod, DepositType } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({ description: 'ID của sản phẩm cho thuê' })
  @IsUUID()
  @IsNotEmpty()
  lens_id: string;

  @ApiProperty({ description: 'Ngày bắt đầu thuê', example: '2026-06-01' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ description: 'Ngày kết thúc thuê', example: '2026-06-05' })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional({ description: 'Số lượng thuê (mặc định 1)', default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  quantity?: number;

  @ApiProperty({ description: 'Hình thức cọc', enum: DepositType })
  @IsEnum(DepositType)
  selected_deposit_type: DepositType;

  @ApiPropertyOptional({ description: 'Ghi chú cọc (nếu cọc bằng giấy tờ)' })
  @IsOptional()
  @IsString()
  deposit_note?: string;

  @ApiPropertyOptional({ description: 'Phương thức giao nhận', enum: DeliveryMethod })
  @IsOptional()
  @IsEnum(DeliveryMethod)
  delivery_method?: DeliveryMethod;

  @ApiPropertyOptional({ description: 'Địa chỉ giao hàng (bắt buộc nếu chọn DELIVERY)' })
  @ValidateIf((o) => o.delivery_method === DeliveryMethod.DELIVERY)
  @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ giao hàng' })
  @IsString()
  delivery_address?: string;
}
