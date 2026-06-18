import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { Promotion } from '@prisma/client';

type DbClient = PrismaService | Prisma.TransactionClient;

export type PromotionDiscountResult = {
  promotion_id: string;
  code: string;
  discount_amount: number;
  discount_type: string;
  sponsor_type: string;
};

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tính giảm giá từ mã khuyến mãi — dùng chung cho validate API và checkout.
   */
  async resolveDiscount(
    code: string,
    subTotal: number,
    lensIds: string[] = [],
    tx?: Prisma.TransactionClient,
  ): Promise<PromotionDiscountResult> {
    const db: DbClient = tx ?? this.prisma;
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      throw new BadRequestException('Mã giảm giá không hợp lệ');
    }

    const promotion = await db.promotion.findUnique({
      where: { code: normalized },
      include: {
        applicable_lenses: { select: { id: true } },
      },
    });

    if (!promotion) {
      throw new NotFoundException('Mã giảm giá không tồn tại');
    }

    this.assertPromotionUsable(promotion, subTotal, lensIds);
    const discount_amount = this.calculateDiscountAmount(promotion, subTotal);

    return {
      promotion_id: promotion.id,
      code: promotion.code,
      discount_amount,
      discount_type: promotion.discount_type,
      sponsor_type: promotion.sponsor_type,
    };
  }

  async validatePromotion(
    code: string,
    subTotal: number,
    lensIds?: string[],
  ) {
    const result = await this.resolveDiscount(code, subTotal, lensIds ?? []);
    return {
      valid: true,
      ...result,
      message: `Áp dụng mã ${result.code} thành công — giảm ${result.discount_amount.toLocaleString('vi-VN')}đ`,
    };
  }

  /** Danh sách mã khuyến mãi user có thể chọn cho giỏ / checkout hiện tại. */
  async listAvailablePromotions(subTotal: number, lensIds: string[] = []) {
    const now = new Date();
    const promotions = await this.prisma.promotion.findMany({
      where: {
        is_active: true,
        start_date: { lte: now },
        end_date: { gte: now },
      },
      include: {
        applicable_lenses: { select: { id: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    const results: Array<{
      promotion_id: string;
      code: string;
      discount_amount: number;
      discount_type: string;
      sponsor_type: string;
      description: string;
      min_order_value: number | null;
      end_date: Date;
    }> = [];

    for (const promotion of promotions) {
      if (
        promotion.usage_limit != null &&
        promotion.used_count >= promotion.usage_limit
      ) {
        continue;
      }

      try {
        this.assertPromotionUsable(promotion, subTotal, lensIds);
        const discount_amount = this.calculateDiscountAmount(promotion, subTotal);
        results.push({
          promotion_id: promotion.id,
          code: promotion.code,
          discount_amount,
          discount_type: promotion.discount_type,
          sponsor_type: promotion.sponsor_type,
          description: this.describePromotion(promotion),
          min_order_value: promotion.min_order_value
            ? Number(promotion.min_order_value)
            : null,
          end_date: promotion.end_date,
        });
      } catch {
        /* Bỏ qua mã không đủ điều kiện */
      }
    }

    return results.sort((a, b) => b.discount_amount - a.discount_amount);
  }

  private describePromotion(promotion: Promotion): string {
    const value = Number(promotion.discount_value);
    if (promotion.discount_type === 'PERCENTAGE') {
      const cap = promotion.max_discount_amount
        ? `, tối đa ${Number(promotion.max_discount_amount).toLocaleString('vi-VN')}đ`
        : '';
      return `Giảm ${value}%${cap}`;
    }
    return `Giảm ${value.toLocaleString('vi-VN')}đ`;
  }

  async incrementUsage(promotionId: string, tx: any) {
    await tx.promotion.update({
      where: { id: promotionId },
      data: { used_count: { increment: 1 } },
    });
  }

  private assertPromotionUsable(
    promotion: Promotion & { applicable_lenses: { id: string }[] },
    subTotal: number,
    lensIds: string[],
  ) {
    if (!promotion.is_active) {
      throw new BadRequestException('Mã giảm giá đã ngừng hoạt động');
    }

    const now = new Date();
    if (now < promotion.start_date || now > promotion.end_date) {
      throw new BadRequestException('Mã giảm giá đã hết hạn hoặc chưa có hiệu lực');
    }

    if (
      promotion.usage_limit != null &&
      promotion.used_count >= promotion.usage_limit
    ) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }

    const minOrder = promotion.min_order_value
      ? Number(promotion.min_order_value)
      : 0;
    if (subTotal < minOrder) {
      throw new BadRequestException(
        `Đơn tối thiểu ${minOrder.toLocaleString('vi-VN')}đ để dùng mã này`,
      );
    }

    if (promotion.applicable_lenses.length > 0 && lensIds.length > 0) {
      const allowed = new Set(promotion.applicable_lenses.map((l) => l.id));
      const ok = lensIds.some((id) => allowed.has(id));
      if (!ok) {
        throw new BadRequestException(
          'Mã giảm giá không áp dụng cho sản phẩm đã chọn',
        );
      }
    }
  }

  private calculateDiscountAmount(promotion: Promotion, subTotal: number): number {
    let discount = 0;
    const value = Number(promotion.discount_value);

    if (promotion.discount_type === 'PERCENTAGE') {
      discount = Math.round((subTotal * value) / 100);
    } else {
      discount = value;
    }

    const cap = promotion.max_discount_amount
      ? Number(promotion.max_discount_amount)
      : null;
    if (cap != null && discount > cap) {
      discount = cap;
    }

    if (discount > subTotal) {
      discount = subTotal;
    }

    return Math.max(0, Math.round(discount * 100) / 100);
  }
}
