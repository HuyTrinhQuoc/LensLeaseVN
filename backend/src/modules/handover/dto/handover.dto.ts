import { IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CreateCheckInDto {
  @IsString()
  @IsOptional()
  note_checkin?: string;

  @IsArray()
  @IsString({ each: true })
  images_checkin: string[];

  @IsString()
  signature_a: string;

  @IsString()
  signature_b: string;
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
}