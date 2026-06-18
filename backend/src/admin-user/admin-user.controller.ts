import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Body,
  Headers,
} from '@nestjs/common';
import { AdminUserService } from './admin-user.service';

@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  getUsers(
    @Headers() headers: Record<string, string>,
    @Query() query: Record<string, string>,
  ) {
    this.adminUserService.assertAdmin(headers);
    return this.adminUserService.getUsers(query);
  }

  @Get(':id')
  getUserDetail(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    this.adminUserService.assertAdmin(headers);
    return this.adminUserService.getUserDetail(id);
  }

  @Patch(':id/kyc')
  updateKycStatus(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
  ) {
    this.adminUserService.assertAdmin(headers);
    return this.adminUserService.updateKycStatus(id, status);
  }
}
