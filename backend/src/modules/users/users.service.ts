import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.users.findMany();
  }

  async createMockUser() {
    return await this.prisma.users.create({
      data: {
        full_name: 'Test Prisma User ' + Math.floor(Math.random() * 100),
        email: `testprisma${Math.floor(Math.random() * 1000)}@lenslease.vn`,
        role: 'renter',
      }
    });
  }
}
