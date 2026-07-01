import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import { ListAvailablePromotionsDto } from './dto/list-available-promotions.dto';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { UpdatePromotionStatusDto } from './dto/update-promotion-status.dto';

@ApiTags('Khuyến mãi (Promotions)')
@Controller()
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post('promotions/available')
  @ApiOperation({
    summary: 'Danh sách mã khuyến mãi áp dụng được cho đơn hiện tại',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async listAvailable(@Body() dto: ListAvailablePromotionsDto) {
    const data = await this.promotionsService.listAvailablePromotions(
      dto.sub_total,
      dto.lens_ids ?? [],
    );
    return {
      message:
        data.length > 0
          ? `Có ${data.length} mã khuyến mãi khả dụng`
          : 'Không có mã khuyến mãi khả dụng cho đơn này',
      data,
    };
  }

  @Post('promotions/validate')
  @ApiOperation({ summary: 'Kiểm tra và tính giảm giá từ mã khuyến mãi' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async validate(@Body() dto: ValidatePromotionDto) {
    const data = await this.promotionsService.validatePromotion(
      dto.code,
      dto.sub_total,
      dto.lens_ids,
    );
    return { message: data.message, data };
  }

  @Get('admin/promotions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin - danh sách voucher toàn hệ thống' })
  async listAdmin(@Headers() headers: Record<string, string>) {
    const data = await this.promotionsService.listAdminPromotions(headers);
    return { message: 'Lấy danh sách voucher thành công', data };
  }

  @Post('admin/promotions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin - tạo voucher nền tảng' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createAdmin(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreatePromotionDto,
  ) {
    const data = await this.promotionsService.createAdminPromotion(headers, dto);
    return { message: 'Tạo voucher nền tảng thành công', data };
  }

  @Patch('admin/promotions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin - cập nhật voucher' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateAdmin(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    const data = await this.promotionsService.updateAdminPromotion(headers, id, dto);
    return { message: 'Cập nhật voucher thành công', data };
  }

  @Patch('admin/promotions/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin - bật/tắt voucher' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateAdminStatus(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdatePromotionStatusDto,
  ) {
    const data = await this.promotionsService.updateAdminPromotionStatus(
      headers,
      id,
      dto.is_active,
    );
    return { message: 'Cập nhật trạng thái voucher thành công', data };
  }

  @Get('owner/promotions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Owner - danh sách voucher của tôi' })
  async listOwner(@Headers() headers: Record<string, string>) {
    const data = await this.promotionsService.listOwnerPromotions(headers);
    return { message: 'Lấy danh sách voucher của bạn thành công', data };
  }

  @Get('owner/promotions/lenses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Owner - danh sách thiết bị có thể gắn voucher' })
  async ownerLenses(@Headers() headers: Record<string, string>) {
    const data = await this.promotionsService.listOwnerLensOptions(headers);
    return { message: 'Lấy danh sách thiết bị thành công', data };
  }

  @Post('owner/promotions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Owner - tạo voucher cho thiết bị của mình' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createOwner(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreatePromotionDto,
  ) {
    const data = await this.promotionsService.createOwnerPromotion(headers, dto);
    return { message: 'Tạo voucher của chủ cho thuê thành công', data };
  }

  @Patch('owner/promotions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Owner - cập nhật voucher của mình' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateOwner(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    const data = await this.promotionsService.updateOwnerPromotion(headers, id, dto);
    return { message: 'Cập nhật voucher thành công', data };
  }

  @Patch('owner/promotions/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Owner - bật/tắt voucher của mình' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateOwnerStatus(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdatePromotionStatusDto,
  ) {
    const data = await this.promotionsService.updateOwnerPromotionStatus(
      headers,
      id,
      dto.is_active,
    );
    return { message: 'Cập nhật trạng thái voucher thành công', data };
  }
}
