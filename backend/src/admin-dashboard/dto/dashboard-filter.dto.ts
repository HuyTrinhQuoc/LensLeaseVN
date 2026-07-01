import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';

export enum DashboardFilterType {
  DAY = 'day',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export class DashboardFilterDto {
  @IsEnum(DashboardFilterType)
  type: DashboardFilterType = DashboardFilterType.YEAR; // Mặc định là năm như HTML

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}