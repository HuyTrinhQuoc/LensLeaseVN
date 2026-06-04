import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminUserService {
  constructor(private prisma: PrismaService) {}

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

  // Lấy chi tiết user (bao gồm CCCD để duyệt KYC)
  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, full_name: true, email: true, role: true, kyc_status: true,
        phone: true, address: true, cccd_front: true, cccd_back: true, created_at: true
      }
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
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