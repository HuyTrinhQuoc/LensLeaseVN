import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PayBookingGroupVnpayDto {
  @ApiPropertyOptional({ example: 'NCB' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  bankCode?: string;
}
