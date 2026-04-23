import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CamerasService } from './cameras.service';

@ApiTags('Products (Máy ảnh & Ống kính)')
@Controller('lenses')
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả sản phẩm (Public)', description: 'Sử dụng cho trang chủ. Lấy tất cả máy ảnh và ống kính, tự động gộp (JOIN) bảng hình ảnh và tên chủ shop.' })
  async getAllLenses() {
    const products = await this.camerasService.findAll();
    return {
      message: 'Lấy danh sách sản phẩm thành công!',
      count: products.length,
      data: products,
    };
  }
}
