import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { CreateWalletTopupDto } from './dto/create-wallet-topup.dto';
import { PayBookingGroupVnpayDto } from './dto/pay-booking-group-vnpay.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Thanh toán (VNPay / MoMo)')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  private redirectAfterVnpay(
    res: Response,
    r: { ok: boolean; message: string; bookingGroupId?: string; orderId?: string },
  ) {
    const msg = r.message;
    if (r.bookingGroupId) {
      const url = this.payments.buildBookingGroupPayResultRedirect(r.ok, r.bookingGroupId, 'vnpay', msg);
      return res.redirect(302, url);
    }
    const url = this.payments.buildWalletTopupResultRedirect(r.ok, 'vnpay', msg);
    return res.redirect(302, url);
  }

  private redirectAfterMomoBookingGroup(
    res: Response,
    r: { ok: boolean; bookingGroupId?: string },
    message?: string,
  ) {
    if (!r.bookingGroupId) {
      const url = this.payments.buildWalletTopupResultRedirect(
        !!r.ok,
        'momo',
        message || 'Thanh toán chưa hoàn tất',
      );
      return res.redirect(302, url);
    }
    const url = this.payments.buildBookingGroupPayResultRedirect(
      !!r.ok,
      r.bookingGroupId,
      'momo',
      message,
    );
    return res.redirect(302, url);
  }

  private clientIp(req: Request): string {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length) {
      return xff.split(',')[0].trim();
    }
    if (Array.isArray(xff) && xff[0]?.length) {
      return String(xff[0]).split(',')[0].trim();
    }
    return req.socket?.remoteAddress || '127.0.0.1';
  }

  private getUserId(headers: Record<string, string>): string {
    const token = headers['authorization']?.replace('Bearer ', '') || headers['x-user-id'];
    if (!token) throw new UnauthorizedException('Vui lòng đăng nhập (Thiếu Token)');
    if (token.split('.').length === 3) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'lenslease_super_secret_key') as {
          userId?: string;
        };
        if (!payload.userId) throw new UnauthorizedException('Token không hợp lệ');
        return payload.userId;
      } catch {
        throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ');
      }
    }
    return token;
  }

  @Get('config')
  @ApiOperation({ summary: 'Cổng thanh toán đã cấu hình (cho UI)' })
  gatewayConfig() {
    return { message: 'OK', data: this.payments.gatewayConfig() };
  }

  @Post('wallet-topup')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo link nạp ví (VNPay hoặc MoMo)' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createWalletTopup(
    @Headers() headers: Record<string, string>,
    @Body() body: CreateWalletTopupDto,
    @Req() req: Request,
  ) {
    const userId = this.getUserId(headers);
    const data = await this.payments.createWalletTopup(
      userId,
      body.amount,
      body.channel,
      this.clientIp(req),
      body.bankCode,
    );
    return { message: 'Tạo thanh toán thành công', data };
  }

  @Get('wallet-topup/vnpay/return')
  @ApiOperation({ summary: 'VNPay return — ví hoặc đặt nhóm (theo vnp_TxnRef)' })
  async vnpayReturn(
    @Query() query: Record<string, string | string[] | undefined>,
    @Res() res: Response,
  ) {
    const r = await this.payments.handleVnpayIpnOrReturn(query);
    return this.redirectAfterVnpay(res, r);
  }

  @Post('booking-groups/:groupId/vnpay')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo link VNPay thanh toán trước cho BookingGroup (tiền vào ví + PAID nhóm)' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createBookingGroupVnpay(
    @Headers() headers: Record<string, string>,
    @Param('groupId') groupId: string,
    @Body() body: PayBookingGroupVnpayDto,
    @Req() req: Request,
  ) {
    const userId = this.getUserId(headers);
    const data = await this.payments.createBookingGroupVnpayCheckout(
      userId,
      groupId,
      this.clientIp(req),
      body.bankCode,
    );
    return { message: 'Tạo link VNPay thành công', data };
  }

  @Get('booking-groups/vnpay/return')
  @ApiOperation({ summary: 'VNPay return — đặt nhóm (cùng handler xác thực)' })
  async bookingGroupVnpayReturn(
    @Query() query: Record<string, string | string[] | undefined>,
    @Res() res: Response,
  ) {
    const r = await this.payments.handleVnpayIpnOrReturn(query);
    return this.redirectAfterVnpay(res, r);
  }

  @Post('booking-groups/:groupId/momo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo link MoMo thanh toán trước cho BookingGroup (tiền vào ví + PAID nhóm)' })
  async createBookingGroupMomo(
    @Headers() headers: Record<string, string>,
    @Param('groupId') groupId: string,
  ) {
    const userId = this.getUserId(headers);
    const data = await this.payments.createBookingGroupMomoCheckout(userId, groupId);
    return { message: 'Tạo link MoMo thành công', data };
  }

  @Post('booking-groups/momo/notify')
  @ApiOperation({ summary: 'MoMo IPN — đặt nhóm' })
  async bookingGroupMomoNotify(@Body() body: Record<string, unknown>, @Res() res: Response) {
    const out = await this.payments.handleMomoNotify(body);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(JSON.stringify(out));
  }

  @Get('booking-groups/momo/return')
  @ApiOperation({ summary: 'MoMo return — đặt nhóm' })
  async bookingGroupMomoReturn(
    @Query() query: Record<string, string | string[] | undefined>,
    @Res() res: Response,
  ) {
    const r = await this.payments.handleMomoReturn(query);
    return this.redirectAfterMomoBookingGroup(res, r, r.ok ? undefined : 'Thanh toán chưa hoàn tất');
  }

  @Get('wallet-topup/vnpay/ipn')
  @ApiOperation({ summary: 'VNPay IPN (server-to-server)' })
  async vnpayIpn(
    @Query() query: Record<string, string | string[] | undefined>,
    @Res() res: Response,
  ) {
    const r = await this.payments.handleVnpayIpnOrReturn(query);
    const payload = {
      RspCode: r.ok ? '00' : '97',
      Message: r.ok ? 'confirm success' : r.message || 'unknown',
    };
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(JSON.stringify(payload));
  }

  @Post('wallet-topup/momo/notify')
  @ApiOperation({ summary: 'MoMo IPN (server-to-server)' })
  async momoNotify(@Body() body: Record<string, unknown>, @Res() res: Response) {
    const out = await this.payments.handleMomoNotify(body);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(JSON.stringify(out));
  }

  @Get('wallet-topup/momo/return')
  @ApiOperation({ summary: 'MoMo return — chuyển hướng về frontend' })
  async momoReturn(
    @Query() query: Record<string, string | string[] | undefined>,
    @Res() res: Response,
  ) {
    const r = await this.payments.handleMomoReturn(query);
    const url = this.payments.buildWalletTopupResultRedirect(
      !!r.ok,
      'momo',
      r.ok ? undefined : 'Thanh toán chưa hoàn tất',
    );
    return res.redirect(302, url);
  }
}
