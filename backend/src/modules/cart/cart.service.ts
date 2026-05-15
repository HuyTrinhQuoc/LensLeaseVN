import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto';
import { LensAvailabilityService } from '../lens-availability/lens-availability.service';
import { parseDateOnlyLocal } from '../../common/date-only.util';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private readonly lensAvailability: LensAvailabilityService,
  ) {}

  /**
   * Lấy hoặc tạo giỏ hàng cho user.
   * Mỗi user chỉ có 1 cart (1:1).
   */
  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { user_id: userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { user_id: userId },
      });
    }

    return cart;
  }

  /**
   * Lấy giỏ hàng đầy đủ (kèm thông tin sản phẩm).
   */
  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    const cartWithItems = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            lens: {
              include: {
                images: true,
                owner: {
                  select: {
                    id: true,
                    full_name: true,
                    rating_avg: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Nhóm items theo owner để UI hiển thị dễ hơn
    const items = cartWithItems?.items ?? [];
    const itemsByOwner = this.groupItemsByOwner(items);

    // Tính tổng tiền
    const summary = this.calculateCartSummary(items);

    return {
      cart_id: cart.id,
      items,
      items_by_owner: itemsByOwner,
      summary,
    };
  }

  /**
   * Thêm sản phẩm vào giỏ hàng.
   * Validate: sản phẩm tồn tại, ngày hợp lệ, còn hàng.
   */
  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    // Validate sản phẩm
    const lens = await this.prisma.lensListing.findUnique({
      where: { id: dto.lens_id },
    });

    if (!lens) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    if (!lens.available || lens.is_deleted) {
      throw new BadRequestException('Sản phẩm hiện không khả dụng');
    }

    if (lens.approval_status !== 'APPROVED') {
      throw new BadRequestException('Sản phẩm chưa được duyệt');
    }

    // Validate ngày thuê (local YYYY-MM-DD)
    const startDate = parseDateOnlyLocal(dto.start_date);
    const endDate = parseDateOnlyLocal(dto.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      throw new BadRequestException('Ngày bắt đầu không thể trong quá khứ');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    await this.lensAvailability.assertLensAvailable(
      this.prisma,
      dto.lens_id,
      startDate,
      endDate,
      dto.quantity,
    );

    // Không cho thuê chính thiết bị của mình
    if (lens.owner_id === userId) {
      throw new BadRequestException('Bạn không thể thuê thiết bị của chính mình');
    }

    // Kiểm tra đã có trong giỏ chưa (cùng lens + cùng ngày)
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cart_id: cart.id,
        lens_id: dto.lens_id,
      },
    });

    if (existingItem) {
      // Cập nhật thay vì thêm mới
      const updated = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: dto.quantity,
          start_date: startDate,
          end_date: endDate,
        },
        include: { lens: { include: { images: true } } },
      });
      return updated;
    }

    // Thêm mới
    const newItem = await this.prisma.cartItem.create({
      data: {
        cart_id: cart.id,
        lens_id: dto.lens_id,
        quantity: dto.quantity,
        start_date: startDate,
        end_date: endDate,
      },
      include: { lens: { include: { images: true } } },
    });

    return newItem;
  }

  /**
   * Cập nhật item trong giỏ (đổi ngày, số lượng).
   */
  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart_id: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    const updateData: any = {};

    if (dto.quantity !== undefined) {
      updateData.quantity = dto.quantity;
    }

    if (dto.start_date) {
      const startDate = parseDateOnlyLocal(dto.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        throw new BadRequestException('Ngày bắt đầu không thể trong quá khứ');
      }
      updateData.start_date = startDate;
    }

    if (dto.end_date) {
      updateData.end_date = parseDateOnlyLocal(dto.end_date);
    }

    // Validate start < end
    const finalStart = updateData.start_date ?? item.start_date;
    const finalEnd = updateData.end_date ?? item.end_date;
    if (finalEnd <= finalStart) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    const finalQty = updateData.quantity ?? item.quantity;

    await this.lensAvailability.assertLensAvailable(
      this.prisma,
      item.lens_id,
      finalStart,
      finalEnd,
      finalQty,
    );

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: updateData,
      include: { lens: { include: { images: true } } },
    });
  }

  /**
   * Xóa item khỏi giỏ hàng.
   */
  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart_id: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { message: 'Đã xóa sản phẩm khỏi giỏ hàng' };
  }

  /**
   * Xóa toàn bộ giỏ hàng.
   */
  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    await this.prisma.cartItem.deleteMany({
      where: { cart_id: cart.id },
    });

    return { message: 'Đã xóa toàn bộ giỏ hàng' };
  }

  /**
   * 5. Gộp giỏ hàng (Merge Cart) từ LocalStorage khi khách đăng nhập.
   */
  async mergeCart(userId: string, items: AddCartItemDto[]) {
    // Duyệt qua từng item từ Frontend gửi lên và tái sử dụng hàm addItem
    for (const dto of items) {
      try {
        await this.addItem(userId, dto);
      } catch {
        /* Bỏ qua từng dòng lỗi (hết slot, lens ẩn, …) để merge không dừng cả giỏ */
      }
    }
    
    // Trả về giỏ hàng mới nhất sau khi gộp
    return this.getCart(userId);
  }

  // ─── HELPER METHODS ────────────────────────────────────

  /**
   * Nhóm cart items theo owner (để tách đơn khi checkout).
   */
  private groupItemsByOwner(items: any[]) {
    const grouped: Record<string, any> = {};

    for (const item of items) {
      const lens = item.lens;
      const ownerId = lens.owner_id;
      
      // 1. Kiểm tra Edge Cases: Sản phẩm có khả dụng không?
      let is_available = true;
      let error_message: string | null = null;

      if (lens.is_deleted || !lens.available || lens.approval_status !== 'APPROVED') {
        is_available = false;
        error_message = 'Sản phẩm đã ngừng kinh doanh hoặc bị ẩn';
      } else if (item.quantity > lens.quantity) {
        is_available = false;
        error_message = `Kho chỉ còn ${lens.quantity} sản phẩm`;
      }

      if (!grouped[ownerId]) {
        grouped[ownerId] = {
          owner: lens.owner,
          items: [],
          sub_total: 0,
        };
      }

      const rentalDays = this.calculateRentalDays(
        new Date(item.start_date),
        new Date(item.end_date),
      );
      
      // Chỉ cộng tiền nếu item khả dụng
      const itemTotal = is_available ? Number(lens.price_per_day) * rentalDays * item.quantity : 0;

      grouped[ownerId].items.push({
        ...item,
        rental_days: rentalDays,
        item_total: itemTotal,
        is_available,
        error_message,
      });
      grouped[ownerId].sub_total += itemTotal;
    }

    return Object.values(grouped);
  }

  /**
   * Tính tổng giỏ hàng.
   */
  private calculateCartSummary(items: any[]) {
    let totalItems = 0;
    let subTotal = 0;

    for (const item of items) {
      const lens = item.lens;
      const is_available = !lens.is_deleted && lens.available && lens.approval_status === 'APPROVED' && item.quantity <= lens.quantity;

      if (is_available) {
        const rentalDays = this.calculateRentalDays(
          new Date(item.start_date),
          new Date(item.end_date),
        );
        totalItems += item.quantity;
        subTotal += Number(lens.price_per_day) * rentalDays * item.quantity;
      }
    }

    return {
      total_items: totalItems,
      total_unique_items: items.length,
      sub_total: subTotal,
    };
  }

  /**
   * Tính số ngày thuê.
   */
  private calculateRentalDays(startDate: Date, endDate: Date): number {
    const diffMs = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
  }
}
