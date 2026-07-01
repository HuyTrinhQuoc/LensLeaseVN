import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; 
import { BookingStatus, Prisma } from '@prisma/client';

@Injectable()
export class AdminBookingService {
  constructor(private prisma: PrismaService) {}

  async findAllBookings(params: {
    skip?: number;
    take?: number;
    status?: BookingStatus;
    search?: string;
  }) {
    const { skip = 0, take = 20, status, search } = params;

    const where: Prisma.BookingWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { owner: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        skip: Number(skip),
        take: Number(take),
        where,
        include: {
          user: { select: { id: true, full_name: true, email: true, phone: true } },
          owner: { select: { id: true, full_name: true, email: true, phone: true } },
          items: {
            include: { lens: { select: { id: true, title: true, thumbnail: true } } },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page: Math.floor(skip / take) + 1, totalPages: Math.ceil(total / take) };
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    return this.prisma.booking.update({
      where: { id },
      data: { status },
    });
  }
}