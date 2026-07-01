import { IsString, IsArray, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateCheckInDto {
  @IsString()
  @IsOptional()
  note_checkin?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional() 
  images_checkin?: string[];

  @IsString()
  @IsOptional() 
  signature_a?: string;

  @IsString()
  @IsOptional() 
  signature_b?: string;
}

export class CreateCheckOutDto {
  @IsString()
  @IsOptional()
  note_checkout?: string;

  @IsArray()
  @IsString({ each: true })
  images_checkout: string[];

  @IsBoolean()
  is_damaged: boolean;

  @IsString()
  @IsNotEmpty({ message: 'Chữ ký nghiệm thu Check-out của chủ máy không được để trống' })
  signature_checkout: string;
}