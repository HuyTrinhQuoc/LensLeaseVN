import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, Promotion, PromotionSponsor, PromotionType, Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import * as jwt from 'jsonwebtoken';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

type DbClient = PrismaService | Prisma.TransactionClient;

type PromotionWithRelations = Promotion & {
  creator: { id: string; full_name: string | null; email: string } | null;
  applicable_lenses: { id: string; title: string; owner_id: string }[];
};

type PromotionPayload = {
  code: string;
  sponsor_type: PromotionSponsor;
  discount_type: PromotionType;
  discount_value: Prisma.Decimal;
  min_order_value: Prisma.Decimal | null;
  max_discount_amount: Prisma.Decimal | null;
  start_date: Date;
  end_date: Date;
  usage_limit: number | null;
  is_active: boolean;
};

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

  async listAdminPromotions(headers: Record<string, string>) {
    await this.assertAdmin(headers);
    const promotions = await this.prisma.promotion.findMany({
      include: {
        creator: { select: { id: true, full_name: true, email: true } },
        applicable_lenses: { select: { id: true, title: true, owner_id: true } },
      },
      orderBy: [{ is_active: 'desc' }, { created_at: 'desc' }],
    });
    return promotions.map((promotion) => this.toManagementRow(promotion));
  }

  async createAdminPromotion(
    headers: Record<string, string>,
    dto: CreatePromotionDto,
  ) {
    const actor = await this.assertAdmin(headers);
    await this.validateCodeUniqueness(dto.code);
    const prepared = await this.preparePromotionPayload(
      dto,
      actor.userId,
      PromotionSponsor.PLATFORM,
    );
    const data = {
      ...prepared.payload,
      creator: { connect: { id: actor.userId } },
      applicable_lenses: {
        connect: prepared.lensIds.map((lensId) => ({ id: lensId })),
      },
    };

    const promotion = (await this.prisma.promotion.create({
      data,
      include: {
        creator: { select: { id: true, full_name: true, email: true } },
        applicable_lenses: { select: { id: true, title: true, owner_id: true } },
      },
    })) as PromotionWithRelations;

    return this.toManagementRow(promotion);
  }

  async updateAdminPromotion(
    headers: Record<string, string>,
    id: string,
    dto: UpdatePromotionDto,
  ) {
    await this.assertAdmin(headers);
    const current = await this.getPromotionOrThrow(id);

    if (dto.code) {
      await this.validateCodeUniqueness(dto.code, id);
    }

    const prepared = await this.preparePromotionPayload(
      dto,
      current.creator_id,
      current.sponsor_type,
      current,
    );
    const data = {
      ...prepared.payload,
      applicable_lenses: {
        set: prepared.lensIds.map((lensId) => ({ id: lensId })),
      },
    };

    const promotion = (await this.prisma.promotion.update({
      where: { id },
      data,
      include: {
        creator: { select: { id: true, full_name: true, email: true } },
        applicable_lenses: { select: { id: true, title: true, owner_id: true } },
      },
    })) as PromotionWithRelations;

    return this.toManagementRow(promotion);
  }

  async updateAdminPromotionStatus(
    headers: Record<string, string>,
    id: string,
    isActive: boolean,
  ) {
    await this.assertAdmin(headers);
    const promotion = (await this.prisma.promotion.update({
      where: { id },
      data: { is_active: isActive },
      include: {
        creator: { select: { id: true, full_name: true, email: true } },
        applicable_lenses: { select: { id: true, title: true, owner_id: true } },
      },
    })) as PromotionWithRelations;
    return this.toManagementRow(promotion);
  }

  async listOwnerPromotions(headers: Record<string, string>) {
    const actor = await this.assertOwner(headers);
    const promotions = await this.prisma.promotion.findMany({
      where: {
        sponsor_type: PromotionSponsor.OWNER,
        creator_id: actor.userId,
      },
      include: {
        creator: { select: { id: true, full_name: true, email: true } },
        applicable_lenses: { select: { id: true, title: true, owner_id: true } },
      },
      orderBy: [{ is_active: 'desc' }, { created_at: 'desc' }],
    });
    return promotions.map((promotion) => this.toManagementRow(promotion));
  }

  async listOwnerLensOptions(headers: Record<string, string>) {
    const actor = await this.assertOwner(headers);
    const lenses = await this.prisma.lensListing.findMany({
      where: {
        owner_id: actor.userId,
        is_deleted: false,
      },
      select: {
        id: true,
        title: true,
        approval_status: true,
        available: true,
        price_per_day: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return lenses.map((lens) => ({
      id: lens.id,
      title: lens.title,
      approval_status: lens.approval_status,
      available: lens.available,
      price_per_day: Number(lens.price_per_day),
    }));
  }

  async createOwnerPromotion(
    headers: Record<string, string>,
    dto: CreatePromotionDto,
  ) {
    const actor = await this.assertOwner(headers);
    await this.validateCodeUniqueness(dto.code);

    const prepared = await this.preparePromotionPayload(
      dto,
      actor.userId,
      PromotionSponsor.OWNER,
    );
    const data = {
      ...prepared.payload,
      creator: { connect: { id: actor.userId } },
      applicable_lenses: {
        connect: prepared.lensIds.map((lensId) => ({ id: lensId })),
      },
    };

    const promotion = (await this.prisma.promotion.create({
      data,
      include: {
        creator: { select: { id: true, full_name: true, email: true } },
        applicable_lenses: { select: { id: true, title: true, owner_id: true } },
      },
    })) as PromotionWithRelations;

    return this.toManagementRow(promotion);
  }

  async updateOwnerPromotion(
    headers: Record<string, string>,
    id: string,
    dto: UpdatePromotionDto,
  ) {
    const actor = await this.assertOwner(headers);
    const current = await this.getOwnerPromotionOrThrow(id, actor.userId);

    if (dto.code) {
      await this.validateCodeUniqueness(dto.code, id);
    }

    const prepared = await this.preparePromotionPayload(
      dto,
      actor.userId,
      PromotionSponsor.OWNER,
      current,
    );
    const data = {
      ...prepared.payload,
      applicable_lenses: {
        set: prepared.lensIds.map((lensId) => ({ id: lensId })),
      },
    };

    const promotion = (await this.prisma.promotion.update({
      where: { id },
      data,
      include: {
        creator: { select: { id: true, full_name: true, email: true } },
        applicable_lenses: { select: { id: true, title: true, owner_id: true } },
      },
    })) as PromotionWithRelations;

    return this.toManagementRow(promotion);
  }

  async updateOwnerPromotionStatus(
    headers: Record<string, string>,
    id: string,
    isActive: boolean,
  ) {
    const actor = await this.assertOwner(headers);
    await this.getOwnerPromotionOrThrow(id, actor.userId);

    const promotion = (await this.prisma.promotion.update({
      where: { id },
      data: { is_active: isActive },
      include: {
        creator: { select: { id: true, full_name: true, email: true } },
        applicable_lenses: { select: { id: true, title: true, owner_id: true } },
      },
    })) as PromotionWithRelations;

    return this.toManagementRow(promotion);
  }

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

    if (promotion.sponsor_type === PromotionSponsor.OWNER) {
      if (promotion.applicable_lenses.length === 0) {
        throw new BadRequestException(
          'Mã của chủ cho thuê chưa được gắn với thiết bị nào',
        );
      }

      if (lensIds.length === 0) {
        throw new BadRequestException(
          'Mã của chủ cho thuê chỉ áp dụng khi đơn có thiết bị phù hợp',
        );
      }
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

  private async assertAdmin(headers: Record<string, string>) {
    const actor = await this.getActor(headers);
    if (actor.role !== Role.ADMIN) {
      throw new UnauthorizedException('Chỉ admin mới được truy cập');
    }
    return actor;
  }

  private async assertOwner(headers: Record<string, string>) {
    const actor = await this.getActor(headers);
    if (actor.role !== Role.OWNER && actor.role !== Role.ADMIN) {
      throw new UnauthorizedException('Chỉ chủ cho thuê mới được truy cập');
    }
    return actor;
  }

  private async getActor(headers: Record<string, string>) {
    const token =
      headers['authorization']?.replace('Bearer ', '') || headers['x-user-id'];
    if (!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập');
    }

    if (token.split('.').length === 3) {
      try {
        const payload = jwt.verify(
          token,
          process.env.JWT_SECRET || 'lenslease_super_secret_key',
        ) as { userId?: string; role?: Role };
        if (!payload.userId || !payload.role) {
          throw new UnauthorizedException('Token không hợp lệ');
        }
        return { userId: payload.userId, role: payload.role };
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: token },
      select: { id: true, role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }
    return { userId: user.id, role: user.role };
  }

  private async getPromotionOrThrow(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        applicable_lenses: { select: { id: true, owner_id: true, title: true } },
      },
    });
    if (!promotion) {
      throw new NotFoundException('Không tìm thấy voucher');
    }
    return promotion;
  }

  private async getOwnerPromotionOrThrow(id: string, ownerId: string) {
    const promotion = await this.getPromotionOrThrow(id);
    if (
      promotion.sponsor_type !== PromotionSponsor.OWNER ||
      promotion.creator_id !== ownerId
    ) {
      throw new UnauthorizedException('Bạn không có quyền chỉnh sửa voucher này');
    }
    return promotion;
  }

  private async validateCodeUniqueness(code: string, excludeId?: string) {
    const existing = await this.prisma.promotion.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException('Mã voucher đã tồn tại');
    }
  }

  private async preparePromotionPayload(
    dto: Partial<CreatePromotionDto>,
    creatorId: string | null | undefined,
    sponsorType: PromotionSponsor,
    current?: Promotion & {
      applicable_lenses: { id: string; owner_id: string; title: string }[];
    },
  ): Promise<{
    payload: PromotionPayload;
    lensIds: string[];
  }> {
    const nextDiscountType = dto.discount_type ?? current?.discount_type;
    const nextDiscountValue = dto.discount_value ?? Number(current?.discount_value ?? 0);
    const nextStartDate = dto.start_date
      ? new Date(dto.start_date)
      : current?.start_date;
    const nextEndDate = dto.end_date ? new Date(dto.end_date) : current?.end_date;

    if (!nextStartDate || !nextEndDate) {
      throw new BadRequestException('Thời gian áp dụng voucher không hợp lệ');
    }

    if (nextStartDate >= nextEndDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    if (nextDiscountValue <= 0) {
      throw new BadRequestException('Giá trị giảm phải lớn hơn 0');
    }

    if (
      nextDiscountType === PromotionType.PERCENTAGE &&
      nextDiscountValue > 100
    ) {
      throw new BadRequestException('Voucher phần trăm không được vượt quá 100%');
    }

    if (!nextDiscountType) {
      throw new BadRequestException('Loại voucher không hợp lệ');
    }

    const nextLensIds = dto.applicable_lens_ids ?? current?.applicable_lenses.map((lens) => lens.id) ?? [];

    if (sponsorType === PromotionSponsor.OWNER) {
      if (!creatorId) {
        throw new BadRequestException('Không xác định được chủ sở hữu voucher');
      }

      if (nextLensIds.length === 0) {
        throw new BadRequestException('Voucher của chủ cho thuê phải chọn ít nhất 1 thiết bị');
      }

      const ownedLenses = await this.prisma.lensListing.findMany({
        where: {
          id: { in: nextLensIds },
          owner_id: creatorId,
          is_deleted: false,
        },
        select: { id: true },
      });

      if (ownedLenses.length !== nextLensIds.length) {
        throw new BadRequestException('Có thiết bị không thuộc quyền sở hữu của bạn');
      }
    }

    const normalizedCode = dto.code?.trim().toUpperCase() ?? current?.code;
    if (!normalizedCode) {
      throw new BadRequestException('Mã voucher không hợp lệ');
    }
    const nextMinOrder =
      dto.min_order_value !== undefined
        ? dto.min_order_value
        : current?.min_order_value != null
          ? Number(current.min_order_value)
          : null;
    const nextMaxDiscount =
      dto.max_discount_amount !== undefined
        ? dto.max_discount_amount
        : current?.max_discount_amount != null
          ? Number(current.max_discount_amount)
          : null;
    const nextUsageLimit =
      dto.usage_limit !== undefined ? dto.usage_limit : current?.usage_limit ?? null;
    const nextIsActive = dto.is_active ?? current?.is_active ?? true;

    return {
      payload: {
        code: normalizedCode,
        sponsor_type: sponsorType,
        discount_type: nextDiscountType,
        discount_value: new Prisma.Decimal(nextDiscountValue),
        min_order_value:
          nextMinOrder == null ? null : new Prisma.Decimal(nextMinOrder),
        max_discount_amount:
          nextMaxDiscount == null ? null : new Prisma.Decimal(nextMaxDiscount),
        start_date: nextStartDate,
        end_date: nextEndDate,
        usage_limit: nextUsageLimit,
        is_active: nextIsActive,
      },
      lensIds: nextLensIds,
    };
  }

  private toManagementRow(promotion: PromotionWithRelations | any) {
    return {
      id: promotion.id,
      code: promotion.code,
      sponsor_type: promotion.sponsor_type,
      discount_type: promotion.discount_type,
      discount_value: Number(promotion.discount_value),
      min_order_value:
        promotion.min_order_value != null ? Number(promotion.min_order_value) : null,
      max_discount_amount:
        promotion.max_discount_amount != null
          ? Number(promotion.max_discount_amount)
          : null,
      start_date: promotion.start_date,
      end_date: promotion.end_date,
      usage_limit: promotion.usage_limit,
      used_count: promotion.used_count,
      is_active: promotion.is_active,
      created_at: promotion.created_at,
      updated_at: promotion.updated_at,
      creator: promotion.creator,
      applicable_lenses: promotion.applicable_lenses.map((lens) => ({
        id: lens.id,
        title: lens.title,
      })),
      description: this.describePromotion(promotion),
    };
  }
}
