import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: string, dto: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.booking_id },
    });

    if (!booking) {
      throw new BadRequestException('Không tìm thấy đơn đặt thuê này.');
    }

    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Đơn hàng chưa hoàn thành, không thể thực hiện đánh giá.',
      );
    }

    if (dto.lens_id) {
      const existingReview = await this.prisma.review.findUnique({
        where: {
          booking_id_lens_id: {
            booking_id: dto.booking_id,
            lens_id: dto.lens_id,
          },
        },
      });

      if (existingReview) {
        throw new BadRequestException(
          'Thiết bị trong đơn đặt thuê này đã được bạn gửi đánh giá trước đó.',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          booking_id: dto.booking_id,
          reviewer_id: userId,
          lens_id: dto.lens_id || null,
          reviewed_user_id: dto.reviewed_user_id || null,
          rating: Number(dto.rating),
          comment: dto.comment || null,
        },
      });

      if (dto.lens_id) {
        const aggregations = await tx.review.aggregate({
          _avg: {
            rating: true,
          },
          _count: {
            rating: true,
          },
          where: {
            lens_id: dto.lens_id,
          },
        });

        await tx.lensListing.update({
          where: { id: dto.lens_id },
          data: {
            rating_avg: aggregations._avg.rating || Number(dto.rating),
            review_count: aggregations._count.rating || 1,
          },
        });
      }

      return review;
    });
  }

  async findReviewsByLens(lensId: string) {
    return await this.prisma.review.findMany({
      where: {
        lens_id: lensId,
      },
      include: {
        reviewer: {
          select: {
            full_name: true,
            avatar_url: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
