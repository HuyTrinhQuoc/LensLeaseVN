import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCameraDto } from './dto/create-camera.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CamerasService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const {
      brand,
      category,
      city,
      district,
      ward,
      available,
      sort,
      page = 1,
      limit = 10,
      search,
      minPrice,
      maxPrice,
      minRating,
      owner_id,
    } = query;

    const where: any = {
      is_deleted: false,
    };

    if (owner_id) {
      where.owner_id = owner_id;
    } else {
      where.approval_status = 'APPROVED';
    }

    if (category) where.category_id = category;
    if (city) where.city = city;
    if (district) where.district = district;
    if (ward) where.ward = ward;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const orderBy: any = { created_at: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.lensListing.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          images: true,
          category: true,
          owner: {
            select: {
              id: true,
              full_name: true,
              email: true,
              rating_avg: true,
            },
          },
        },
      }),
      this.prisma.lensListing.count({ where }),
    ]);

    return {
      data: products,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findById(id: string) {
    const product = await this.prisma.lensListing.findUnique({
      where: { id },
      include: {
        images: true,
        specs: true,
        category: true,
        owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            rating_avg: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm này!');
    }
    return product;
  }

  // ==========================================
  // LOGIC ĐĂNG TIN MỚI ĐƯỢC GỘP VÀO ĐÂY
  // ==========================================
  async createListing(createListingDto: any, userId: string) {
    const { images, ...listingData } = createListingDto;

    const dataToSave = {
      title: listingData.name || 'Sản phẩm mới',
      brand: listingData.brand || null,
      description: listingData.description || null,
      price_per_day: listingData.price_per_day || 0,
      required_deposit_amount: listingData.deposit_value || 0,
      category_id: listingData.category_id || null,
      owner_id: userId,
      available: true,
      is_deleted: false,
      approval_status: 'PENDING' as const,
    };

    const imageObjects =
      images?.map((url: string) => ({ image_url: url })) || [];

    return await this.prisma.lensListing.create({
      data: {
        ...dataToSave,
        images: {
          create: imageObjects,
        },
      },
    });
  }
}
