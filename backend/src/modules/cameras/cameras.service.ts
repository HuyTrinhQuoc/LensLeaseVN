import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CamerasService {
  constructor(private prisma: PrismaService) {}

  // Lấy toàn bộ danh sách Máy ảnh / Ống kính (Lens Listings)
  // Kèm theo hình ảnh (lens_images) và thông tin người cho thuê (owner)
async findAll(query: any) {
  const { 
    type, 
    brand, 
    category, 
    location, 
    available, 
    sort, 
    page = 1, 
    limit = 10,
    search 
  } = query;

  const where: any = {};

  // 📂 filter type
  if (type) {
    where.type = type;
  }

  // 📂 filter brand
  if (brand) {
    where.brand = brand;
  }

  // 📂 filter category
  if (category) {
    where.category = category;
  }

  // 📂 filter location
  if (location) {
    where.location = location;
  }

  // 📂 filter available
  if (available !== undefined) {
    where.available = available === 'true' || available === true;
  }

  // 📂 filter search
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
    ];
  }

  // 🔀 sort
  let orderBy: any = { created_at: 'desc' };

  if (sort === "rating") {
    orderBy = { rating_avg: 'desc' };
  }

  if (sort === "price_asc") {
    orderBy = { price_per_day: 'asc' };
  }

  if (sort === "price_desc") {
    orderBy = { price_per_day: 'desc' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [products, total] = await Promise.all([
    this.prisma.lens_listings.findMany({
      where,
      orderBy,
      skip,
      take: parseInt(limit),
      include: {
        lens_images: true,
        owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
          }
        }
      }
    }),
    this.prisma.lens_listings.count({ where })
  ]);

  return {
    data: products,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit))
  };
}

  // Lấy chi tiết một sản phẩm theo ID
  async findById(id: string) {
    const product = await this.prisma.lens_listings.findUnique({
      where: { id },
      include: {
        lens_images: true,
        specs: true,
        owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            address: true,
          }
        },
        bookings: {
          select: {
            start_date: true,
            end_date: true,
            status: true,
          }
        }
      }
    });

    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }

    return product;
  }
}
