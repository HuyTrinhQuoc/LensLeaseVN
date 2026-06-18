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
import { AdminFinanceService } from './admin-finance.service';

@ApiTags('Admin — Tài chính')
@Controller('admin/finance')
export class AdminFinanceController {
  constructor(private readonly adminFinanceService: AdminFinanceService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Tổng quan tài chính hệ thống' })
  async getSummary(@Headers() headers: Record<string, string>) {
    this.adminFinanceService.assertAdmin(headers);
    const data = await this.adminFinanceService.getSummary();
    return { message: 'Lấy tổng quan tài chính thành công', data };
  }

  @Get('payouts')
  @ApiOperation({ summary: 'Danh sách yêu cầu rút tiền' })
  async listPayouts(
    @Headers() headers: Record<string, string>,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.adminFinanceService.assertAdmin(headers);
    const result = await this.adminFinanceService.listPayouts({
      status,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    return { message: 'Lấy danh sách rút tiền thành công', ...result };
  }

  @Patch('payouts/:id/approve')
  @ApiOperation({ summary: 'Duyệt chi rút tiền' })
  async approvePayout(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body('admin_note') adminNote?: string,
  ) {
    const adminId = this.adminFinanceService.assertAdmin(headers);
    const data = await this.adminFinanceService.approvePayout(
      adminId,
      id,
      adminNote,
    );
    return { message: 'Đã duyệt chi thành công', data };
  }

  @Patch('payouts/:id/reject')
  @ApiOperation({ summary: 'Từ chối yêu cầu rút tiền (hoàn tiền về ví)' })
  async rejectPayout(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body('rejection_reason') rejectionReason: string,
  ) {
    const adminId = this.adminFinanceService.assertAdmin(headers);
    const data = await this.adminFinanceService.rejectPayout(
      adminId,
      id,
      rejectionReason,
    );
    return { message: 'Đã từ chối yêu cầu rút tiền và hoàn tiền về ví', data };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Lịch sử giao dịch toàn hệ thống' })
  async getTransactions(
    @Headers() headers: Record<string, string>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.adminFinanceService.assertAdmin(headers);
    const result = await this.adminFinanceService.getRecentTransactions(
      Number(page) || 1,
      Number(limit) || 20,
    );
    return { message: 'Lấy lịch sử giao dịch thành công', ...result };
  }
}
