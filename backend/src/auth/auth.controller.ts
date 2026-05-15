import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
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
    // req.user sẽ chứa thông tin sau khi hàm validate trong google.strategy chạy xong
    const user = req.user;

    // Tạo token cho user ở đây (tuỳ logic của bạn)
    const token = await this.authService.googleLogin(req);

    // CHÍNH LÀ KHÚC NÀY: Backend đẩy người dùng về lại trang chủ Frontend kèm theo token
    // Giả sử Frontend của bạn chạy ở cổng 5173 (Vite)
    return res.redirect(`http://localhost:5173?token=${token}`);
  }
}