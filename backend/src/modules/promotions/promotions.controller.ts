import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import { ListAvailablePromotionsDto } from './dto/list-available-promotions.dto';

@ApiTags('Khuyến mãi (Promotions)')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post('available')
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

  @Post('validate')
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
}
