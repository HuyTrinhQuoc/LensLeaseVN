import { Controller, Get, Post, Body, Query, Param, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CamerasService } from './cameras.service';

@ApiTags('Products (Máy ảnh & Ống kính)')
@Controller('lenses')
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  async getAllLenses(@Query() query: any) {
    const result = await this.camerasService.findAll(query);
    return {
      message: 'Lấy danh sách sản phẩm thành công!',
      ...result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm' })
  async getCameraById(@Param('id') id: string) {
    const product = await this.camerasService.findById(id); 
    return {
      message: 'Lấy chi tiết sản phẩm thành công!',
      data: product,
    };
  }

  @Post()
  @ApiOperation({ 
    summary: 'Đăng tin thiết bị cho thuê mới', 
    description: 'Yêu cầu client truyền header x-user-id để xác định chủ sở hữu (owner_id)' 
  })
  async createListing(
    @Headers('x-user-id') userId: string, 
    @Body() dto: any
  ) {
    if (!userId) {
      throw new HttpException('Missing x-user-id header', HttpStatus.UNAUTHORIZED);
    }

    return await this.camerasService.createListing(dto, userId);
  }
}