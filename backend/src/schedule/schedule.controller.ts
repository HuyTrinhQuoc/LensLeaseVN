import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // <-- Import thẳng từ passport giống bên Auth
import { DeviceScheduleService } from './schedule.service';

@Controller('owner/schedule')
export class DeviceScheduleController {
  constructor(private readonly scheduleService: DeviceScheduleService) {}

  // Dùng AuthGuard('jwt') giống hệt bên kia
  @UseGuards(AuthGuard('jwt')) 
  @Get('equipments')
  async getEquipments(@Request() req: any) {
    // req.user sẽ chứa payload của token (ví dụ: req.user.userId)
    const ownerId = req.user.userId; 
    return this.scheduleService.getOwnerEquipments(ownerId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('events/:lensId')
  async getEvents(@Param('lensId') lensId: string) {
    return this.scheduleService.getEquipmentEvents(lensId);
  }
}