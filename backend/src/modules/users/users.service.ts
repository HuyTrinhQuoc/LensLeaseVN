import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

/** Trường an toàn cho profile công khai / API thường — không có ảnh CCCD. */
const SAFE_PROFILE_SELECT = {
  id: true,
  email: true,
  full_name: true,
  phone: true,
  address: true,
  role: true,
  status: true,
  avatar_url: true,
  bio: true,
  created_at: true,
  rating_avg: true,
  kyc_status: true,
} as const;

/** Profile công khai — ẩn email & phone. */
const PUBLIC_PROFILE_SELECT = {
  id: true,
  full_name: true,
  address: true,
  role: true,
  avatar_url: true,
  bio: true,
  created_at: true,
  rating_avg: true,
  kyc_status: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.user.findMany({
      select: SAFE_PROFILE_SELECT,
    });
  }

  async createMockUser() {
    return await this.prisma.user.create({
      data: {
        full_name: 'Test Prisma User ' + Math.floor(Math.random() * 100),
        email: `testprisma${Math.floor(Math.random() * 1000)}@lenslease.vn`,
        role: 'USER',
      },
      select: SAFE_PROFILE_SELECT,
    });
  }

  /** Hồ sơ của chính user — không trả ảnh CCCD (chỉ trạng thái KYC). */
  async findOwnProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SAFE_PROFILE_SELECT,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /** Profile công khai theo ID — không lộ CCCD / email / phone. */
  async findPublicProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_PROFILE_SELECT,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(id: string, data: Record<string, unknown>) {
    const allowedFields = ['full_name', 'phone', 'address', 'avatar_url', 'bio'];
    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    return await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: SAFE_PROFILE_SELECT,
    });
  }
}
