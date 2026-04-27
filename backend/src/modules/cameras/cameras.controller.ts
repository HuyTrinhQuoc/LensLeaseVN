import { Controller, Get, Query } from '@nestjs/common';
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
}