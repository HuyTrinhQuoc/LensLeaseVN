import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto';
import * as jwt from 'jsonwebtoken';

/**
 * Tạm thời dùng Header x-user-id để xác thực.
 * Sau này sẽ chuyển sang JWT AuthGuard.
 */
@ApiTags('Giỏ hàng (Cart)')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Helper: Lấy userId từ header (tạm thời).
   * TODO: Thay bằng @CurrentUser() decorator khi có AuthGuard.
   */
  private getUserId(headers: Record<string, string>): string {
    const token = headers['authorization']?.replace('Bearer ', '') || headers['x-user-id'];
    if (!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập (Thiếu Token)');
    }
    
    // Nếu token là chuỗi JWT (có chứa dấu chấm)
    if (token.split('.').length === 3) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'lenslease_super_secret_key') as any;
        return payload.userId;
      } catch (e) {
        throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ');
      }
    }
    
    return token; // Dành cho test truyền thẳng ID
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy giỏ hàng',
    description: 'Trả về toàn bộ giỏ hàng của user, kèm thông tin sản phẩm, nhóm theo owner, và tổng tiền.',
  })
  async getCart(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    const cart = await this.cartService.getCart(userId);
    return {
      message: 'Lấy giỏ hàng thành công',
      data: cart,
    };
  }

  @Post('merge')
  @ApiOperation({
    summary: 'Gộp giỏ hàng (Merge Cart)',
    description: 'Dành cho trường hợp khách (Guest) thêm đồ vào giỏ ở LocalStorage, sau đó đăng nhập. Gọi API này để gộp đồ vào Database.',
  })
  async mergeCart(
    @Headers() headers: Record<string, string>,
    @Body() body: { items: AddCartItemDto[] },
  ) {
    const userId = this.getUserId(headers);
    const cart = await this.cartService.mergeCart(userId, body.items || []);
    return {
      message: 'Gộp giỏ hàng thành công',
      data: cart,
    };
  }

  @Post('items')
  @ApiOperation({
    summary: 'Thêm sản phẩm vào giỏ',
    description: 'Thêm thiết bị cho thuê vào giỏ hàng. Phải chọn ngày bắt đầu và kết thúc thuê.',
  })
  async addItem(
    @Headers() headers: Record<string, string>,
    @Body() dto: AddCartItemDto,
  ) {
    const userId = this.getUserId(headers);
    const item = await this.cartService.addItem(userId, dto);
    return {
      message: 'Đã thêm sản phẩm vào giỏ hàng',
      data: item,
    };
  }

  @Patch('items/:id')
  @ApiOperation({
    summary: 'Cập nhật item trong giỏ',
    description: 'Cập nhật số lượng hoặc ngày thuê cho item đã có trong giỏ.',
  })
  @ApiParam({ name: 'id', description: 'ID của cart_item' })
  async updateItem(
    @Headers() headers: Record<string, string>,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const userId = this.getUserId(headers);
    const item = await this.cartService.updateItem(userId, itemId, dto);
    return {
      message: 'Đã cập nhật giỏ hàng',
      data: item,
    };
  }

  @Delete('items/:id')
  @ApiOperation({
    summary: 'Xóa item khỏi giỏ',
    description: 'Xóa 1 sản phẩm khỏi giỏ hàng.',
  })
  @ApiParam({ name: 'id', description: 'ID của cart_item' })
  async removeItem(
    @Headers() headers: Record<string, string>,
    @Param('id') itemId: string,
  ) {
    const userId = this.getUserId(headers);
    return this.cartService.removeItem(userId, itemId);
  }

  @Delete()
  @ApiOperation({
    summary: 'Xóa toàn bộ giỏ hàng',
    description: 'Xóa tất cả sản phẩm trong giỏ hàng.',
  })
  async clearCart(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.cartService.clearCart(userId);
  }
}
