


import { AdminBookingService } from './admin-booking.service';
import { Controller, Get, Query, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
// Import AdminGuard nếu bạn có

@Controller('admin/bookings')
export class AdminBookingController {
  constructor(private readonly AdminBookingService: AdminBookingService) {}

  @Get()
  async getBookings(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status?: BookingStatus,
    @Query('search') search?: string,
  ) {
    const take = limit ? Number(limit) : 20;
    const skip = page ? (Number(page) - 1) * take : 0;
    return this.AdminBookingService.findAllBookings({ skip, take, status, search });
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
  ) {
    return this.AdminBookingService.updateBookingStatus(id, status);
  }
}