import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOwnerApplicationDto {
  @ApiProperty({ example: '0901234567' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  area: string;

  @ApiProperty({ example: 'Máy ảnh DSLR, Lens, Tripod' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  equipment_types: string;

  @ApiPropertyOptional({ example: 'Tôi có Sony A7IV và vài lens GM muốn cho thuê cuối tuần.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
