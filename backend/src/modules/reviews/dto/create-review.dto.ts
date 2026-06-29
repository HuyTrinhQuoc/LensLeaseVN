import { IsString, IsNumber, IsOptional, Min, Max, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  booking_id: string;

  @IsOptional()
  @IsUUID()
  lens_id?: string;

  @IsOptional()
  @IsUUID()
  reviewed_user_id?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;
}