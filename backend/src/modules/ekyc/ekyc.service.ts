import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as jwt from 'jsonwebtoken';
import { S3KycStorageService } from '../../storage/s3-kyc.storage';

export type FptIdCardData = {
  id?: string;
  name?: string;
  dob?: string;
  sex?: string;
  nationality?: string;
  home?: string;
  address?: string;
  doe?: string;
};

@Injectable()
export class EkycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Kyc: S3KycStorageService,
  ) {}

  resolveUserId(headers: Record<string, string>): string {
    const token =
      headers['authorization']?.replace('Bearer ', '') ||
      headers['x-user-id'];
    if (!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập');
    }
    if (token.split('.').length === 3) {
      try {
        const payload = jwt.verify(
          token,
          process.env.JWT_SECRET || 'lenslease_super_secret_key',
        ) as { userId?: string };
        if (!payload.userId) {
          throw new UnauthorizedException('Token không hợp lệ');
        }
        return payload.userId;
      } catch {
        throw new UnauthorizedException('Token không hợp lệ');
      }
    }
    return token;
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        kyc_status: true,
        full_name: true,
      },
    });
    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }
    return {
      kyc_status: user.kyc_status,
      is_verified: user.kyc_status === 'APPROVED',
      has_cccd_images: user.kyc_status === 'APPROVED',
      full_name: user.full_name,
    };
  }

  async verifyAndSubmit(
    userId: string,
    frontFile: Express.Multer.File,
    backFile: Express.Multer.File,
  ) {
    if (!frontFile?.buffer?.length) {
      throw new BadRequestException('Vui lòng tải ảnh mặt trước CCCD');
    }
    if (!backFile?.buffer?.length) {
      throw new BadRequestException('Vui lòng tải ảnh mặt sau CCCD');
    }

    const maxBytes = 5 * 1024 * 1024;
    if (frontFile.size > maxBytes || backFile.size > maxBytes) {
      throw new BadRequestException('Ảnh CCCD tối đa 5MB mỗi mặt');
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(frontFile.mimetype) || !allowed.includes(backFile.mimetype)) {
      throw new BadRequestException('Chỉ hỗ trợ ảnh JPG, PNG, WEBP');
    }

    const ocr = await this.callFptIdCardOcr(frontFile.buffer, frontFile.mimetype);

    const idNumber = ocr.id?.replace(/\s/g, '');
    if (!idNumber || idNumber.length < 9) {
      throw new BadRequestException(
        'Không đọc được số CCCD từ ảnh mặt trước. Vui lòng chụp lại rõ hơn.',
      );
    }

    const duplicate = await this.prisma.user.findFirst({
      where: {
        cccd_number: idNumber,
        id: { not: userId },
        is_deleted: false,
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new BadRequestException(
        'Số CCCD này đã được liên kết với tài khoản khác. Mỗi CCCD chỉ đăng ký một tài khoản.',
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { cccd_front: true, cccd_back: true },
    });

    const frontKey = await this.s3Kyc.uploadKycImage(
      userId,
      'front',
      frontFile.buffer,
      frontFile.mimetype,
    );
    const backKey = await this.s3Kyc.uploadKycImage(
      userId,
      'back',
      backFile.buffer,
      backFile.mimetype,
    );

    if (existing?.cccd_front && this.s3Kyc.isS3ObjectKey(existing.cccd_front) && existing.cccd_front !== frontKey) {
      await this.s3Kyc.deleteObject(existing.cccd_front);
    }
    if (existing?.cccd_back && this.s3Kyc.isS3ObjectKey(existing.cccd_back) && existing.cccd_back !== backKey) {
      await this.s3Kyc.deleteObject(existing.cccd_back);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        cccd_front: frontKey,
        cccd_back: backKey,
        cccd_number: idNumber,
        kyc_status: 'APPROVED',
        full_name: ocr.name?.trim() || undefined,
        address: ocr.address?.trim() || ocr.home?.trim() || undefined,
      },
      select: {
        id: true,
        full_name: true,
        kyc_status: true,
        address: true,
      },
    });

    return {
      user: updated,
      verified: true,
    };
  }

  /** Gọi FPT.AI OCR CCCD — API key chỉ dùng trên server. */
  private async callFptIdCardOcr(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<FptIdCardData> {
    const apiKey = process.env.FPT_AI_API_KEY;
    if (!apiKey?.trim()) {
      throw new InternalServerErrorException(
        'Chưa cấu hình FPT_AI_API_KEY trên server',
      );
    }

    const ext = mimeType.includes('png')
      ? 'png'
      : mimeType.includes('webp')
        ? 'webp'
        : 'jpg';

    const form = new FormData();
    form.append(
      'image',
      new Blob([Uint8Array.from(imageBuffer)], { type: mimeType }),
      `cccd-front.${ext}`,
    );

    const res = await fetch('https://api.fpt.ai/vision/idr/vnm', {
      method: 'POST',
      headers: {
        'api-key': apiKey.trim(),
      },
      body: form,
    });

    const raw = await res.text();
    let payload: {
      errorCode?: number;
      errorMessage?: string;
      data?: FptIdCardData[];
    };

    try {
      payload = JSON.parse(raw) as typeof payload;
    } catch {
      throw new BadRequestException(
        'FPT.AI trả về dữ liệu không hợp lệ. Thử lại sau.',
      );
    }

    if (!res.ok) {
      throw new BadRequestException(
        payload.errorMessage ||
          `FPT.AI lỗi HTTP ${res.status}. Kiểm tra ảnh CCCD và API key.`,
      );
    }

    if (payload.errorCode !== 0 || !payload.data?.length) {
      throw new BadRequestException(
        this.formatFptOcrError(payload.errorMessage) ||
          'Không nhận diện được CCCD trên ảnh mặt trước. Chụp lại rõ nét, đủ ánh sáng, không bị mờ hoặc che khuất.',
      );
    }

    return payload.data[0];
  }

  /** Ưu tiên thông báo tiếng Việt; giữ nguyên nếu FPT trả message có nội dung. */
  private formatFptOcrError(errorMessage?: string): string | undefined {
    const msg = errorMessage?.trim();
    if (!msg) return undefined;
    const lower = msg.toLowerCase();
    if (lower.includes('blur') || lower.includes('quality') || lower.includes('unclear')) {
      return 'Ảnh CCCD mặt trước quá mờ hoặc chất lượng thấp. Vui lòng chụp lại rõ nét, đủ ánh sáng.';
    }
    if (lower.includes('not found') || lower.includes('no card') || lower.includes('detect')) {
      return 'Không tìm thấy CCCD trong ảnh mặt trước. Đặt thẻ nằm gọn trong khung hình và chụp lại.';
    }
    return msg;
  }

  async assertUserKycApproved(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kyc_status: true },
    });
    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }
    if (user.kyc_status !== 'APPROVED') {
      throw new BadRequestException(
        'Bạn cần hoàn tất xác thực eKYC (CCCD) trước khi đặt thuê thiết bị.',
      );
    }
  }
}
