import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async createMockUser() {
    return await this.prisma.user.create({
      data: {
        full_name: 'Test Prisma User ' + Math.floor(Math.random() * 100),
        email: `testprisma${Math.floor(Math.random() * 1000)}@lenslease.vn`,
        role: 'USER',
      }
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
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
        cccd_front: true,
        cccd_back: true,
        kyc_status: true,
        // Exclude password_hash
      }
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(id: string, data: any) {
    // Chỉ cho phép update một số field nhất định
    const allowedFields = ['full_name', 'phone', 'address', 'avatar_url', 'bio', 'cccd_front', 'cccd_back'];
    const updateData: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }
    
    return await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        address: true,
        role: true,
        avatar_url: true,
        bio: true,
        created_at: true,
        rating_avg: true,
        kyc_status: true,
      }
    });
  }
}
