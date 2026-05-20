import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateCameraDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  price_per_day: number;

  @IsNumber()
  @IsNotEmpty()
  required_deposit_amount: number;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsString()
  @IsNotEmpty()
  owner_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[]; 
}