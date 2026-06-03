import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  // POST: /auth/register
  @Post('register')
  register(@Body() dto: any) {
    return this.authService.register(dto);
  }

  // 🆕 GET: /auth/verify?token=xxx
  @Get('verify')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // POST: /auth/login
  @Post('login')
  login(@Body() dto: any) {
    return this.authService.login(dto);
  }

  // GET: /auth/google (Mở màn hình chọn tài khoản Google)
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) { }

  // GET: /auth/google/callback (Google trả kết quả về đây)
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.googleLogin(req);
    
    // 🆕 Gửi cả token và user data về frontend qua query string
    const queryParams = new URLSearchParams({
      token: result.accessToken,
      email: result.user.email,
      fullName: result.user.full_name || '',
      picture: result.user.avatar_url || '',
    }).toString();
    
    // Khuyên dùng biến môi trường để sau này deploy không bị lỗi
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
return res.redirect(`${frontendUrl}/login/success?${queryParams}`);
  }

  // 🆕 GET: /auth/me - Lấy thông tin user hiện tại
@Get('me')
@UseGuards(AuthGuard('jwt'))
async getMe(@Req() req: any) {
  return this.authService.getMe(req.user.userId);
}
}