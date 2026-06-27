import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  // 🆕 Tạo verification token
  private generateVerificationToken(email: string): string {
    return this.jwtService.sign({ email, type: 'verify' }, { expiresIn: '24h' });
  }

  // 1. ĐĂNG KÝ (LOCAL) + GỬI MAIL XÁC NHẬN
  async register(dto: any) {
    const { email, password, fullname, phone } = dto;

    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new BadRequestException('Email đã tồn tại!');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        full_name: fullname,
        phone,
        auth_provider: 'LOCAL',
        role: 'USER',
        is_verified: false, // 🆕 Thêm trạng thái chưa xác minh
      },
    });

    // 🆕 Tạo verification token và gửi email
    const verifyToken = this.generateVerificationToken(email);
    const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${verifyToken}`;
    
    try {
      await this.mailService.sendVerificationEmail(email, fullname, verifyLink);
    } catch (error) {
      console.error('Lỗi gửi email xác nhận:', error);
      // Có thể xóa user nếu muốn, hoặc để user thử gửi lại email sau
    }

    return { 
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản',
      user: { id: newUser.id, email: newUser.email, full_name: newUser.full_name }
    };
  }

  // 🆕 XÁC NHẬN EMAIL
  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'verify') {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const user = await this.prisma.user.findUnique({ where: { email: payload.email } });
      
      if (!user) {
        throw new UnauthorizedException('Tài khoản không tồn tại');
      }

      if (user.is_verified) {
        return { message: 'Email đã được xác nhận trước đó' };
      }

      await this.prisma.user.update({
        where: { email: payload.email },
        data: { is_verified: true },
      });

      return { message: 'Email xác nhận thành công! Bạn có thể đăng nhập ngay' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ');
    }
  }

  // 2. ĐĂNG NHẬP (LOCAL)
  async login(dto: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.password_hash || !(await bcrypt.compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('Sai email hoặc mật khẩu!');
    }

    // 🆕 Kiểm tra email đã xác nhận hay chưa
    if (!user.is_verified) {
      throw new UnauthorizedException('Vui lòng xác nhận email trước khi đăng nhập');
    }

    const accessToken = this.jwtService.sign({ userId: user.id, role: user.role });
    return { 
      message: 'Đăng nhập thành công',
      accessToken, 
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role,
      }
    };
  }


// 3. ĐĂNG NHẬP GOOGLE (Lưu DB + Trả Token)
async googleLogin(req: any) {
  const { email, firstName, lastName, avatar_url, provider_id } = req.user;

  const fullName = `${firstName} ${lastName}`.trim();

  let user = await this.prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Nếu chưa có tài khoản -> Tự động tạo mới
    user = await this.prisma.user.create({
      data: {
        email,
        full_name: fullName,
        avatar_url,
        auth_provider: 'GOOGLE',
        provider_id: provider_id, // 🆕 Lưu provider_id từ Google
        role: 'USER',
        is_verified: true,
      },
    });
  } else {
    // Cập nhật avatar + provider_id nếu chưa có
    user = await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        avatar_url,
        provider_id: provider_id || user.provider_id, // 🆕 Cập nhật nếu chưa có
      },
    });
  }

  const accessToken = this.jwtService.sign({ userId: user.id, role: user.role });
  return { 
    accessToken, 
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
    }
  };
}

// 🆕 Lấy thông tin user từ database
async getMe(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      full_name: true,
      avatar_url: true,
      phone: true,
      role: true,
      auth_provider: true,
      provider_id: true,
      is_verified: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new UnauthorizedException('User không tồn tại');
  }

  return user;
}
}