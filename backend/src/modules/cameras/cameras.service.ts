import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

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
      // Chủ máy xem thiết bị của mình, hiển thị cả chưa duyệt
      where.owner_id = owner_id;
    } else {
      // Khách hàng xem: chỉ hiển thị thiết bị Đã Duyệt
      where.approval_status = 'APPROVED';
    }

    // ======================
    // CATEGORY
    // ======================
    if (category) where.category_id = category;

    // ======================
    // LOCATION
    // ======================
    if (city) where.city = city;
    if (district) where.district = district;
    if (ward) where.ward = ward;

    // ======================
    // BRAND
    // ======================
    if (brand) where.brand = brand;

    // ======================
    // AVAILABLE
    // ======================
    if (available !== undefined) {
      where.available = available === 'true' || available === true;
    }

    // ======================
    // PRICE FILTER (SAFE)
    // ======================
    if (minPrice || maxPrice) {
      where.price_per_day = {
        ...(minPrice ? { gte: Number(minPrice) } : {}),
        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
      };
    }

    // ======================
    // RATING FILTER
    // ======================
    if (minRating) {
      where.rating_avg = {
        gte: Number(minRating),
      };
    }

    // ======================
    // SEARCH SAFE
    // ======================
    const keyword = search?.trim();
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
        { brand: { contains: keyword, mode: 'insensitive' } },
        { city: { contains: keyword, mode: 'insensitive' } },
        { district: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // ======================
    // SORT CLEAN
    // ======================
    let orderBy: any = { created_at: 'desc' };

    switch (sort) {
      case 'rating':
        orderBy = { rating_avg: 'desc' };
        break;

      case 'price_asc':
        orderBy = { price_per_day: 'asc' };
        break;

      case 'price_desc':
        orderBy = { price_per_day: 'desc' };
        break;

      case 'newest':
        orderBy = { created_at: 'desc' };
        break;

      case 'oldest':
        orderBy = { created_at: 'asc' };
        break;

      case 'popular':
        orderBy = { review_count: 'desc' };
        break;
    }

    // ======================
    // PAGINATION SAFE
    // ======================
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

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
          phone: true,
          rating_avg: true,
        },
      },
    },
  });

  if (!product) {
    throw new NotFoundException(`Không tìm thấy thiết bị với ID: ${id}`);
  }

  // SỬA Ở ĐÂY: Trả về trực tiếp object product thay vì bọc { data: product }
  return product; 
}
  
}