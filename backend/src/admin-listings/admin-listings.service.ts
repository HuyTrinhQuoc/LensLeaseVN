import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApprovalStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AdminListingsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async listListings(query: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.LensListingWhereInput = {
      is_deleted: false,
    };

    if (query.status) {
      const s = query.status.toUpperCase() as ApprovalStatus;
      if (['PENDING', 'APPROVED', 'REJECTED'].includes(s)) {
        where.approval_status = s;
      }
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { owner: { full_name: { contains: q, mode: 'insensitive' } } },
        { owner: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.lensListing.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          images: { take: 1 },
          category: { select: { id: true, name: true } },
          owner: {
            select: {
              id: true,
              full_name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      }),
      this.prisma.lensListing.count({ where }),
    ]);

    const data = rows.map((l) => ({
      id: l.id,
      title: l.title,
      brand: l.brand,
      thumbnail: l.thumbnail,
      image_url: l.thumbnail || l.images[0]?.image_url || null,
      price_per_day: Number(l.price_per_day),
      market_value: l.market_value != null ? Number(l.market_value) : null,
      approval_status: l.approval_status,
      available: l.available,
      city: l.city,
      district: l.district,
      created_at: l.created_at,
      category: l.category,
      owner: l.owner,
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getListingById(id: string) {
    const listing = await this.prisma.lensListing.findFirst({
      where: { id, is_deleted: false },
      include: {
        images: true,
        category: true,
        specs: true,
        owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
      },
    });
    if (!listing) {
      throw new NotFoundException('Không tìm thấy tin đăng');
    }
    return {
      ...listing,
      price_per_day: Number(listing.price_per_day),
      market_value:
        listing.market_value != null ? Number(listing.market_value) : null,
      required_deposit_amount:
        listing.required_deposit_amount != null
          ? Number(listing.required_deposit_amount)
          : null,
    };
  }

  async approveListing(id: string) {
    const listing = await this.prisma.lensListing.findFirst({
      where: { id, is_deleted: false },
    });
    if (!listing) {
      throw new NotFoundException('Không tìm thấy tin đăng');
    }
    if (listing.approval_status === 'APPROVED') {
      throw new BadRequestException('Tin đăng đã được duyệt trước đó');
    }

    const updated = await this.prisma.lensListing.update({
      where: { id },
      data: {
        approval_status: 'APPROVED',
        available: true,
      },
      include: {
        category: { select: { id: true, name: true } },
        owner: { select: { id: true, full_name: true, email: true } },
      },
    });

    return {
      ...updated,
      price_per_day: Number(updated.price_per_day),
      market_value:
        updated.market_value != null ? Number(updated.market_value) : null,
    };
  }

  async rejectListing(id: string, reason?: string) {
    const listing = await this.prisma.lensListing.findFirst({
      where: { id, is_deleted: false },
    });
    if (!listing) {
      throw new NotFoundException('Không tìm thấy tin đăng');
    }
    if (listing.approval_status === 'REJECTED') {
      throw new BadRequestException('Tin đăng đã bị từ chối trước đó');
    }

    const note = reason?.trim();
    const updated = await this.prisma.lensListing.update({
      where: { id },
      data: {
        approval_status: 'REJECTED',
        available: false,
        description: note
          ? `${listing.description || ''}\n\n[Lý do từ chối admin]: ${note}`.trim()
          : listing.description,
      },
      include: {
        category: { select: { id: true, name: true } },
        owner: { select: { id: true, full_name: true, email: true } },
      },
    });

    return {
      ...updated,
      price_per_day: Number(updated.price_per_day),
      market_value:
        updated.market_value != null ? Number(updated.market_value) : null,
    };
  }

  async getStatusCounts() {
    const [pending, approved, rejected] = await Promise.all([
      this.prisma.lensListing.count({
        where: { is_deleted: false, approval_status: 'PENDING' },
      }),
      this.prisma.lensListing.count({
        where: { is_deleted: false, approval_status: 'APPROVED' },
      }),
      this.prisma.lensListing.count({
        where: { is_deleted: false, approval_status: 'REJECTED' },
      }),
    ]);
    return { pending, approved, rejected };
  }
}
