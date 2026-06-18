import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OwnerApplicationsService } from './owner-applications.service';
import { CreateOwnerApplicationDto } from './dto/create-owner-application.dto';
import { ReviewOwnerApplicationDto } from './dto/review-owner-application.dto';

@ApiTags('Đăng ký chủ cho thuê')
@Controller()
export class OwnerApplicationsController {
  constructor(private readonly service: OwnerApplicationsService) {}

  @Post('owner-applications')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'USER gửi đơn đăng ký làm chủ cho thuê' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async submit(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateOwnerApplicationDto,
  ) {
    const userId = this.service.getUserId(headers);
    const data = await this.service.submit(userId, dto);
    return { message: 'Đã gửi đơn đăng ký chủ cho thuê. Vui lòng chờ admin duyệt.', data };
  }

  @Get('owner-applications/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trạng thái đơn đăng ký chủ cho thuê của tôi' })
  async getMine(@Headers() headers: Record<string, string>) {
    const userId = this.service.getUserId(headers);
    const data = await this.service.getMine(userId);
    return { message: 'OK', data };
  }

  @Get('admin/owner-applications')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin — danh sách đơn đăng ký chủ cho thuê' })
  async listAdmin(
    @Headers() headers: Record<string, string>,
    @Query('status') status?: string,
  ) {
    this.service.assertAdmin(headers);
    const data = await this.service.listForAdmin(status);
    return { message: 'OK', data };
  }

  @Patch('admin/owner-applications/:id/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin — duyệt đơn, nâng USER → OWNER' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async approve(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: ReviewOwnerApplicationDto,
  ) {
    this.service.assertAdmin(headers);
    const data = await this.service.approve(id, dto.admin_note);
    return { message: 'Đã duyệt — tài khoản đã được cấp quyền chủ cho thuê (OWNER)', data };
  }

  @Patch('admin/owner-applications/:id/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin — từ chối đơn đăng ký chủ cho thuê' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async reject(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: ReviewOwnerApplicationDto,
  ) {
    this.service.assertAdmin(headers);
    const data = await this.service.reject(id, dto.admin_note);
    return { message: 'Đã từ chối đơn đăng ký', data };
  }
}
