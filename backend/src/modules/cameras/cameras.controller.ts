import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CamerasService } from './cameras.service';

@ApiTags('Products (Máy ảnh & Ống kính)')
@Controller('lenses')
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) {}

  @Get()
  async getAllLenses(@Query() query: any) {
    const result = await this.camerasService.findAll(query);

    return {
      message: 'Lấy danh sách sản phẩm thành công!',
      ...result,
    };
  }

  @Get(':id')
  async getLensById(@Param('id') id: string) {
    const product = await this.camerasService.findById(id);

    return {
      message: 'Lấy chi tiết sản phẩm thành công!',
      data: product,
    };
  }
}