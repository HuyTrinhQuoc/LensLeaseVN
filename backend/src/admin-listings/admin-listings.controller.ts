import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminListingsService } from './admin-listings.service';

@ApiTags('Admin — Duyệt tin đăng')
@Controller('admin/listings')
export class AdminListingsController {
  constructor(private readonly adminListingsService: AdminListingsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Số lượng tin theo trạng thái duyệt' })
  async getStats(@Headers() headers: Record<string, string>) {
    this.adminListingsService.assertAdmin(headers);
    const data = await this.adminListingsService.getStatusCounts();
    return { message: 'Lấy thống kê tin đăng thành công', data };
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách tin đăng (lọc theo approval_status)' })
  async list(
    @Headers() headers: Record<string, string>,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.adminListingsService.assertAdmin(headers);
    const result = await this.adminListingsService.listListings({
      status,
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    return { message: 'Lấy danh sách tin đăng thành công', ...result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết tin đăng' })
  async getById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    this.adminListingsService.assertAdmin(headers);
    const data = await this.adminListingsService.getListingById(id);
    return { message: 'Lấy chi tiết tin đăng thành công', data };
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Duyệt tin đăng → APPROVED' })
  async approve(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    this.adminListingsService.assertAdmin(headers);
    const data = await this.adminListingsService.approveListing(id);
    return { message: 'Đã duyệt tin đăng thành công', data };
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Từ chối tin đăng → REJECTED' })
  async reject(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    this.adminListingsService.assertAdmin(headers);
    const data = await this.adminListingsService.rejectListing(id, reason);
    return { message: 'Đã từ chối tin đăng', data };
  }
}
