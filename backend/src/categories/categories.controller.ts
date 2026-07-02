import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
// import { RolesGuard } from '../auth/guards/roles.guard'; // Guard phân quyền của bạn
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN') // Mở ra để chỉ chặn Admin mới được tạo
  async create(@Body() body: { name: string; description?: string }) {
    return this.categoriesService.create(body);
  }

  @Put(':id')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() body: { name: string; description?: string }) {
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  // @UseGuards(RolesGuard)
  // @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}