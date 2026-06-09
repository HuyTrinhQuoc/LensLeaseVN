import { Controller, Post, Put, Get, Param, Body } from '@nestjs/common';
import { HandoverService } from './handover.service';
import { CreateCheckInDto, CreateCheckOutDto } from './dto/handover.dto';

@Controller('handover-reports')
export class HandoverController {
  constructor(private readonly handoverService: HandoverService) {}

  @Get(':bookingId')
  async getReport(@Param('bookingId') bookingId: string) {
    return this.handoverService.getReportByBooking(bookingId);
  }

  @Post(':bookingId/check-in')
  async checkIn(@Param('bookingId') bookingId: string, @Body() dto: CreateCheckInDto) {
    return this.handoverService.processCheckIn(bookingId, dto);
  }

  @Put(':bookingId/check-out')
  async checkOut(@Param('bookingId') bookingId: string, @Body() dto: CreateCheckOutDto) {
    return this.handoverService.processCheckOut(bookingId, dto);
  }
}