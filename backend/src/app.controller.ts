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
  async getSuggestions(@Query('q') q: string) {
    if (!q || q.trim().length === 0) {
      return [];
    }

    const suggestions = await this.prisma.lens_listings.findMany({
      where: {
        title: {
          contains: q,
          mode: 'insensitive',
        },
      },
      select: {
        title: true,
      },
      take: 5,
      distinct: ['title'],
    });

    return suggestions.map((item) => item.title);
  }
}
