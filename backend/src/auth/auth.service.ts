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
  ) {}

  // 1. ĐĂNG KÝ (LOCAL) + GỬI MAIL
  async register(dto: any) {
    const { email, password, fullname, phone } = dto;

    if (await this.prisma.users.findUnique({ where: { email } })) {
      throw new BadRequestException('Email đã tồn tại!');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.users.create({
      data: {
        email,
        password_hash: passwordHash,
        full_name: fullname,
        phone,
        auth_provider: 'LOCAL',
        role: 'USER',
      },
    });

    // Gửi mail ngầm
    this.mailService.sendWelcomeEmail(newUser.email as string, newUser.full_name || 'bạn');

    return { message: 'Đăng ký thành công', user: newUser };
  }

  // 2. ĐĂNG NHẬP (LOCAL)
  async login(dto: any) {
    const user = await this.prisma.users.findUnique({ where: { email: dto.email } });

    if (!user || !user.password_hash || !(await bcrypt.compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('Sai email hoặc mật khẩu!');
    }

    const accessToken = this.jwtService.sign({ userId: user.id, role: user.role });
    return { message: 'Đăng nhập thành công', accessToken, user };
  }

  // 3. ĐĂNG NHẬP GOOGLE (Lưu DB + Trả Token)
  async googleLogin(req: any) {
    const { email, fullName, providerId } = req.user;

    let user = await this.prisma.users.findUnique({ where: { email } });

    if (!user) {
      // Nếu chưa có tài khoản -> Tự động tạo mới
      user = await this.prisma.users.create({
        data: {
          email,
          full_name: fullName,
          auth_provider: 'GOOGLE',
          provider_id: providerId,
          role: 'USER',
        },
      });
    }

    // Cấp phát Token y như đăng nhập thường
    const accessToken = this.jwtService.sign({ userId: user.id, role: user.role });
    return { message: 'Đăng nhập Google thành công', accessToken, user };
  }
}