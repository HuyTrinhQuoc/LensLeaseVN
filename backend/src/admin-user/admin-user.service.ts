import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3KycStorageService } from '../storage/s3-kyc.storage';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AdminUserService {
  constructor(
    private prisma: PrismaService,
    private readonly s3Kyc: S3KycStorageService,
  ) {}

  assertAdmin(headers: Record<string, string>): string {
    const token =
      headers['authorization']?.replace('Bearer ', '') ||
      headers['x-user-id'];
    if (!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập');
    }

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

  // Lấy danh sách user kèm bộ lọc
  async getUsers(query: { search?: string; role?: string; kyc_status?: string }) {
    const { search, role, kyc_status } = query;

    return this.prisma.user.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { full_name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          } : {},
          role ? { role: role as any } : {},
          kyc_status ? { kyc_status: kyc_status as any } : {},
          { is_deleted: false } // Không lấy user đã xóa
        ]
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        kyc_status: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' }
    });
  }

  // Lấy chi tiết user (signed URL ảnh CCCD — không trả S3 key thô)
  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, full_name: true, email: true, role: true, kyc_status: true,
        phone: true, address: true, cccd_front: true, cccd_back: true, cccd_number: true, created_at: true
      }
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const [cccd_front_url, cccd_back_url] = await Promise.all([
      this.s3Kyc.resolveViewUrl(user.cccd_front),
      this.s3Kyc.resolveViewUrl(user.cccd_back),
    ]);

    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      kyc_status: user.kyc_status,
      phone: user.phone,
      address: user.address,
      created_at: user.created_at,
      cccd_number: user.cccd_number,
      cccd_front_url,
      cccd_back_url,
      has_cccd_images: Boolean(cccd_front_url && cccd_back_url),
    };
  }

  // Cập nhật trạng thái KYC
  async updateKycStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const user = await this.prisma.user.update({
      where: { id },
      data: { kyc_status: status }
    });
    return { message: 'Cập nhật trạng thái KYC thành công', user };
  }
}