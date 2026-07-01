import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';
import { CamerasService } from './cameras.service';
import { CreateCameraDto } from './dto/create-camera.dto';

@ApiTags('Products (Máy ảnh & Ống kính)')
@Controller('lenses')
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) {}

  private parseOptionalViewer(headers: Record<string, string>) {
    const token =
      headers['authorization']?.replace('Bearer ', '') || headers['x-user-id'];
    if (!token || token.split('.').length !== 3) {
      return undefined;
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'lenslease_super_secret_key',
      ) as { userId?: string; sub?: string; role?: string };
      const userId = payload.userId ?? payload.sub;
      if (!userId) return undefined;
      return { userId, role: payload.role };
    } catch {
      return undefined;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  async getAllLenses(@Query() query: any) {
    const result = await this.camerasService.findAll(query);
    return {
      message: 'Lấy danh sách sản phẩm thành công!',
      ...result,
    };
  }

  @Get('compare')
  @ApiOperation({ summary: 'Lấy dữ liệu so sánh danh sách sản phẩm' })
  async compareProducts(@Query('ids') ids: string) {
    const products = await this.camerasService.compareProducts(ids);
    return {
      message: 'Lấy dữ liệu so sánh sản phẩm thành công!',
      data: products,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm' })
  async getCameraById(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>,
  ) {
    const viewer = this.parseOptionalViewer(headers);
    const product = await this.camerasService.findById(id, viewer);
    return {
      message: 'Lấy chi tiết sản phẩm thành công!',
      data: product,
    };
  }

  @Get('categories/all')
  @ApiOperation({ summary: 'Lấy toàn bộ danh mục sản phẩm từ Database' })
  async getCategories() {
    const categories = await this.camerasService.getCategories();
    return {
      message: 'Lấy danh sách danh mục thành công!',
      data: categories,
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Đăng tin thiết bị cho thuê mới',
    description:
      'Yêu cầu client truyền header x-user-id để xác định chủ sở hữu (owner_id)',
  })
  async createListing(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateCameraDto,
  ) {
    if (!userId) {
      throw new HttpException(
        'Missing x-user-id header',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return await this.camerasService.createListing(dto, userId);
  }
}
