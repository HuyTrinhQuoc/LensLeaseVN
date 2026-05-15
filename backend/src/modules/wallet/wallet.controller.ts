import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import * as jwt from 'jsonwebtoken';
import { IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({ example: 1000000, description: 'Số tiền muốn rút (VNĐ)' })
  @IsNumber({}, { message: 'Số tiền rút phải là một con số' })
  @Min(10000, { message: 'Số tiền rút tối thiểu là 10,000 VNĐ' })
  amount: number;
}

export class DepositDto {
  @ApiProperty({ example: 500000, description: 'Số tiền nạp (VNĐ)' })
  @IsNumber({}, { message: 'Số tiền nạp phải là một con số' })
  @Min(1, { message: 'Số tiền nạp tối thiểu là 1 VNĐ' })
  amount: number;

  @ApiPropertyOptional({ description: 'Ghi chú giao dịch' })
  @IsOptional()
  @IsString()
  description?: string;
}

@ApiTags('Ví ký quỹ (Wallet / Escrow)')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  private getUserId(headers: Record<string, string>): string {
    const token = headers['authorization']?.replace('Bearer ', '') || headers['x-user-id'];
    if (!token) throw new UnauthorizedException('Vui lòng đăng nhập (Thiếu Token)');

    if (token.split('.').length === 3) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'lenslease_super_secret_key') as any;
        return payload.userId;
      } catch (e) {
        throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ');
      }
    }
    return token;
  }

  @Get()
  @ApiOperation({
    summary: 'Xem số dư ví',
    description: 'Trả về available_balance (rút được) và pending_balance (đang giữ escrow).',
  })
  async getBalance(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    const balance = await this.walletService.getBalance(userId);
    return { message: 'Lấy số dư ví thành công', data: balance };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Thống kê ví',
    description: 'Tổng thu, tổng phí sàn, tổng hoàn cọc.',
  })
  async getStats(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    const stats = await this.walletService.getWalletStats(userId);
    return { message: 'Lấy thống kê ví thành công', data: stats };
  }

  @Get('ledger')
  @ApiOperation({
    summary: 'Sổ cái ví (biến động available/pending)',
    description: 'Dữ liệu từ bảng wallet_transactions — audit từng lần đổi số dư.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getLedger(
    @Headers() headers: Record<string, string>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(headers);
    const result = await this.walletService.getLedger(userId, Number(page) || 1, Number(limit) || 30);
    return { message: 'Lấy sổ cái ví thành công', ...result };
  }

  @Get('payouts')
  @ApiOperation({
    summary: 'Lệnh rút tiền của tôi',
    description: 'Danh sách Payout (PENDING / PROCESSING / COMPLETED / REJECTED).',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getPayouts(
    @Headers() headers: Record<string, string>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(headers);
    const result = await this.walletService.getPayouts(userId, Number(page) || 1, Number(limit) || 20);
    return { message: 'Lấy danh sách rút tiền thành công', ...result };
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'Lịch sử giao dịch',
    description: 'Danh sách giao dịch ví, lọc theo loại (DEPOSIT, RENTAL_FEE, REFUND, COMMISSION, PAYOUT).',
  })
  @ApiQuery({ name: 'type', required: false, description: 'Lọc loại giao dịch' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getTransactions(
    @Headers() headers: Record<string, string>,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(headers);
    const result = await this.walletService.getTransactions(
      userId, Number(page) || 1, Number(limit) || 20, type,
    );
    return { message: 'Lấy lịch sử giao dịch thành công', ...result };
  }

  @Post('withdraw')
  @ApiOperation({
    summary: 'Yêu cầu rút tiền',
    description: 'Rút tiền từ available_balance về tài khoản ngân hàng đã đăng ký.',
  })
  async withdraw(
    @Headers() headers: Record<string, string>,
    @Body() body: WithdrawDto,
  ) {
    const userId = this.getUserId(headers);
    const result = await this.walletService.requestWithdrawal(userId, body.amount);
    return result;
  }

  @Post('deposit')
  @ApiOperation({
    summary: 'Nạp tiền vào ví (mô phỏng)',
    description:
      'Cộng available_balance và ghi nhận giao dịch DEPOSIT. Dùng cho dev/QA; tích hợp VNPay/MoMo thật sẽ thay endpoint này.',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async deposit(
    @Headers() headers: Record<string, string>,
    @Body() body: DepositDto,
  ) {
    const userId = this.getUserId(headers);
    return this.walletService.depositSimulated(userId, body.amount, body.description);
  }
}
