import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('suggestions')
  async getSuggestions(
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ) {
    const keyword = q?.trim();
    if (!keyword) {
      return { data: [] };
    }

    const take = Math.min(Math.max(Number(limit) || 8, 1), 12);

    const items = await this.prisma.lensListing.findMany({
      where: {
        is_deleted: false,
        available: true,
        approval_status: 'APPROVED',
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { brand: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        brand: true,
        thumbnail: true,
        price_per_day: true,
        category: { select: { name: true } },
      },
      take,
      orderBy: [{ review_count: 'desc' }, { created_at: 'desc' }],
    });

    return {
      data: items.map((item) => ({
        id: item.id,
        title: item.title,
        brand: item.brand,
        thumbnail: item.thumbnail,
        price_per_day: Number(item.price_per_day),
        category_name: item.category?.name ?? null,
      })),
    };
  }
}
