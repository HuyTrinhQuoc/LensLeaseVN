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

    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
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
  async createListing(createListingDto: CreateCameraDto, userId: string) {
    try {
      const { images, specs, ...listingData } = createListingDto;

      const mainThumbnail = images && images.length > 0 ? images[0] : null;

      const imageObjects =
        images?.map((url: string) => ({ image_url: url })) || [];

      return await this.prisma.lensListing.create({
        data: {
          owner_id: userId,
          title: listingData.name || 'Sản phẩm mới',
          brand: listingData.brand || null,
          description: listingData.description || null,
          category_id: listingData.category_id || null,
          city: listingData.city || null,
          district: listingData.district || null,
          ward: listingData.ward || null,
          thumbnail: mainThumbnail,
          quantity: 1,
          available: true,
          is_deleted: false,
          approval_status: 'PENDING',

          price_per_day: new Prisma.Decimal(listingData.price_per_day || 0),
          market_value: new Prisma.Decimal(listingData.deposit_value || 0),

          images: {
            create: imageObjects,
          },

          specs: {
            create: {
              focal_length: specs?.focal_length || 'N/A',
              max_aperture: specs?.max_aperture || 'N/A',
              mount: specs?.mount || 'N/A',
              sensor_format: specs?.sensor_format || 'Full Frame',
            },
          },
        },
        include: {
          images: true,
          specs: true,
        },
      });
    } catch (error) {
      console.error('Lỗi chi tiết tại hàm createListing Backend:', error);
      throw new InternalServerErrorException(
        error.message || 'Lỗi hệ thống khi chèn dữ liệu đăng tin!',
      );
    }
  }

  async getCategories() {
    try {
      return await this.prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh mục:', error);
      throw new InternalServerErrorException(
        'Không thể lấy danh sách danh mục!',
      );
    }
  }
}
