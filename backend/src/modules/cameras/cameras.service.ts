import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CamerasService {
  constructor(private prisma: PrismaService) {}

  // Lấy toàn bộ danh sách Máy ảnh / Ống kính (Lens Listings)
  // Kèm theo hình ảnh (lens_images) và thông tin người cho thuê (owner)
  async findAll() {
    return await this.prisma.lens_listings.findMany({
      include: {
        lens_images: true, // Join bảng hình ảnh
        owner: {
          select: {
            full_name: true,
            email: true,
          }
        } // Lấy tên người cho thuê
      }
    });
  }
}
