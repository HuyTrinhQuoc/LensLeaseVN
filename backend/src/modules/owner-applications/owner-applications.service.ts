import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateOwnerApplicationDto } from './dto/create-owner-application.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class OwnerApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  getUserId(headers: Record<string, string>): string {
    const token = headers['authorization']?.replace('Bearer ', '') || headers['x-user-id'];
    if (!token) throw new UnauthorizedException('Vui lòng đăng nhập');

    if (token.split('.').length === 3) {
      try {
        const payload = jwt.verify(
          token,
          process.env.JWT_SECRET || 'lenslease_super_secret_key',
        ) as { userId?: string };
        if (!payload.userId) throw new UnauthorizedException('Token không hợp lệ');
        return payload.userId;
      } catch {
        throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ');
      }
    }
    return token;
  }

  assertAdmin(headers: Record<string, string>): string {
    const token = headers['authorization']?.replace('Bearer ', '') || headers['x-user-id'];
    if (!token) throw new UnauthorizedException('Vui lòng đăng nhập');

    if (token.split('.').length === 3) {
      try {
        const payload = jwt.verify(
          token,
          process.env.JWT_SECRET || 'lenslease_super_secret_key',
        ) as { userId?: string; role?: string };
        if (payload.role !== 'ADMIN') {
          throw new UnauthorizedException('Chỉ admin mới được truy cập');
        }
        return payload.userId as string;
      } catch (e) {
        if (e instanceof UnauthorizedException) throw e;
        throw new UnauthorizedException('Token không hợp lệ');
      }
    }
    throw new UnauthorizedException('Token không hợp lệ');
  }

  async submit(userId: string, dto: CreateOwnerApplicationDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');
    if (user.role === 'OWNER') {
      throw new BadRequestException('Tài khoản đã là chủ cho thuê');
    }
    if (user.role === 'ADMIN') {
      throw new BadRequestException('Tài khoản quản trị không cần đăng ký chủ cho thuê');
    }

    const pending = await this.prisma.ownerApplication.findFirst({
      where: { user_id: userId, status: 'PENDING' },
    });
    if (pending) {
      throw new BadRequestException('Bạn đã có đơn đăng ký chủ cho thuê đang chờ duyệt');
    }

    const application = await this.prisma.ownerApplication.create({
      data: {
        user_id: userId,
        phone: dto.phone.trim(),
        area: dto.area.trim(),
        equipment_types: dto.equipment_types.trim(),
        description: dto.description?.trim() || null,
      },
      include: {
        user: { select: { id: true, full_name: true, email: true, role: true } },
      },
    });

    if (!user.phone?.trim()) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { phone: dto.phone.trim() },
      });
    }

    return application;
  }

  async getMine(userId: string) {
    return this.prisma.ownerApplication.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async listForAdmin(status?: string) {
    return this.prisma.ownerApplication.findMany({
      where: status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' } : undefined,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            role: true,
            kyc_status: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async approve(applicationId: string, adminNote?: string) {
    return this.prisma.$transaction(async (tx) => {
      const app = await tx.ownerApplication.findUnique({
        where: { id: applicationId },
        include: { user: true },
      });
      if (!app) throw new NotFoundException('Không tìm thấy đơn đăng ký');
      if (app.status !== 'PENDING') {
        throw new BadRequestException('Đơn không còn ở trạng thái chờ duyệt');
      }
      if (app.user.role === 'OWNER') {
        throw new BadRequestException('Người dùng đã là chủ cho thuê');
      }

      const updated = await tx.ownerApplication.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          reviewed_at: new Date(),
          admin_note: adminNote?.trim() || null,
        },
      });

      await tx.user.update({
        where: { id: app.user_id },
        data: { role: 'OWNER' },
      });

      return updated;
    });
  }

  async reject(applicationId: string, adminNote?: string) {
    const app = await this.prisma.ownerApplication.findUnique({ where: { id: applicationId } });
    if (!app) throw new NotFoundException('Không tìm thấy đơn đăng ký');
    if (app.status !== 'PENDING') {
      throw new BadRequestException('Đơn không còn ở trạng thái chờ duyệt');
    }

    return this.prisma.ownerApplication.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        reviewed_at: new Date(),
        admin_note: adminNote?.trim() || null,
      },
    });
  }
}
