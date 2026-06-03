import { Controller, Get, Param, Patch, Query, Body, UseGuards } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin/users')
// @UseGuards(AuthGuard('jwt')) // Nhớ bật Guard để bảo mật API Admin
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  getUsers(@Query() query: any) {
    return this.adminUserService.getUsers(query);
  }

  @Get(':id')
  getUserDetail(@Param('id') id: string) {
    return this.adminUserService.getUserDetail(id);
  }

  @Patch(':id/kyc')
  updateKycStatus(
    @Param('id') id: string, 
    @Body('status') status: 'APPROVED' | 'REJECTED'
  ) {
    return this.adminUserService.updateKycStatus(id, status);
  }
}