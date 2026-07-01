import { Controller, Get, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

@Controller('admin-dashboard') // Đã đổi đường dẫn endpoint thành /admin-dashboard
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  // Bạn có thể gắn RolesGuard hoặc JwtAuthGuard tại đây nếu muốn bảo mật phân quyền ADMIN [cite: 48]
  async getMetrics(@Query() filterDto: DashboardFilterDto) {
    return this.dashboardService.getDashboardMetrics(filterDto);
  }
}