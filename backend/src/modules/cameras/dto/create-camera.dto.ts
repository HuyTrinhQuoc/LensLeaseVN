import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreateCameraSpecDto {
  @IsString()
  @IsOptional()
  focal_length?: string;

  @IsString()
  @IsOptional()
  max_aperture?: string;

  @IsString()
  @IsOptional()
  mount?: string;

  @IsString()
  @IsOptional()
  sensor_format?: string;
}

export class CreateCameraDto {
  @IsString()
  @IsNotEmpty()
  name: string; 

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
  deposit_value: number; 

  @IsString()
  @IsNotEmpty()
  category_id: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsOptional()
  ward?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsObject()
  @IsOptional()
  specs?: CreateCameraSpecDto;
}