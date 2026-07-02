import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // 1. Lấy tất cả danh mục (Dùng cho cả User và Admin)
  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { lens_listings: true } // Đếm xem danh mục có bao nhiêu sản phẩm
        }
      }
    });
  }

  // 2. Thêm mới danh mục (Admin)
  async create(data: { name: string; description?: string }) {
    // Kiểm tra xem tên danh mục đã tồn tại chưa vì trường name là @unique
    const exist = await this.prisma.category.findUnique({
      where: { name: data.name },
    });
    if (exist) {
      throw new ConflictException('Tên danh mục này đã tồn tại!');
    }

    return this.prisma.category.create({ data });
  }

  // 3. Cập nhật danh mục (Admin)
  async update(id: string, data: { name: string; description?: string }) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục!');

    // Kiểm tra trùng tên với danh mục khác
    if (data.name && data.name !== category.name) {
      const exist = await this.prisma.category.findUnique({ where: { name: data.name } });
      if (exist) throw new ConflictException('Tên danh mục mới đã tồn tại!');
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  // 4. Xóa danh mục (Admin)
  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { lens_listings: true } // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
    });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục!');
    
    if (category.lens_listings.length > 0) {
      throw new ConflictException('Không thể xóa danh mục đang có sản phẩm thuộc về!');
    }

    return this.prisma.category.delete({ where: { id } });
  }
}