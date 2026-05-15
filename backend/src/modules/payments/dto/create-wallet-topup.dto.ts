import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum WalletTopupChannelDto {
  VNPAY = 'VNPAY',
  MOMO = 'MOMO',
}

export class CreateWalletTopupDto {
  @ApiProperty({ example: 500000, description: 'Số tiền nạp (VNĐ)' })
  @IsNumber()
  @Min(10000, { message: 'Số tiền tối thiểu 10.000đ' })
  amount: number;

  @ApiProperty({ enum: WalletTopupChannelDto })
  @IsEnum(WalletTopupChannelDto)
  channel: WalletTopupChannelDto;

  /** Chỉ áp dụng VNPay (sandbox thường dùng NCB). Bỏ trống = để khách chọn trên cổng. */
  @ApiPropertyOptional({ example: 'NCB', description: 'Mã ngân hàng VNPay (tùy chọn)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  bankCode?: string;
}
