import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

const DEFAULT_SIGNED_URL_TTL_SEC = 600;

@Injectable()
export class S3KycStorageService {
  private readonly logger = new Logger(S3KycStorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly prefix: string;
  private readonly configured: boolean;

  constructor() {
    const region = process.env.AWS_REGION?.trim() || 'ap-southeast-1';
    this.bucket = process.env.AWS_S3_BUCKET?.trim() || '';
    this.prefix = (process.env.AWS_S3_KYC_PREFIX || 'kyc').trim().replace(/\/$/, '');
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

    this.configured = Boolean(this.bucket && accessKeyId && secretAccessKey);

    this.client = new S3Client({
      region,
      followRegionRedirects: true,
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
    });

    if (!this.configured) {
      this.logger.warn(
        'AWS S3 chưa cấu hình đủ (AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)',
      );
    }
  }

  assertConfigured() {
    if (!this.configured) {
      throw new InternalServerErrorException(
        'Chưa cấu hình AWS S3 cho lưu ảnh CCCD trên server',
      );
    }
  }

  buildObjectKey(userId: string, side: 'front' | 'back', mimeType: string): string {
    const ext = this.extensionFromMime(mimeType);
    return `${this.prefix}/${userId}/${side}.${ext}`;
  }

  /** Upload ảnh CCCD — trả về S3 object key (lưu vào DB). */
  async uploadKycImage(
    userId: string,
    side: 'front' | 'back',
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    this.assertConfigured();
    const key = this.buildObjectKey(userId, side, mimeType);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          ServerSideEncryption: 'AES256',
          Metadata: {
            purpose: 'ekyc-cccd',
            userId,
            side,
          },
        }),
      );
    } catch (err: unknown) {
      const code =
        err && typeof err === 'object' && 'Code' in err
          ? String((err as { Code?: string }).Code)
          : '';
      if (code === 'PermanentRedirect' || code === 'AuthorizationHeaderMalformed') {
        throw new InternalServerErrorException(
          'Cấu hình AWS S3 sai region. Kiểm tra AWS_REGION trong .env phải trùng region tạo bucket.',
        );
      }
      this.logger.error(`Upload S3 thất bại (${key})`, err);
      throw new InternalServerErrorException(
        'Không lưu được ảnh CCCD lên S3. Kiểm tra quyền IAM và cấu hình bucket.',
      );
    }

    return key;
  }

  /**
   * Tạo signed URL để admin xem ảnh (hết hạn sau vài phút).
   * Hỗ trợ legacy: giá trị `data:image/...` base64 trong DB.
   */
  async resolveViewUrl(
    stored: string | null | undefined,
    expiresInSec = DEFAULT_SIGNED_URL_TTL_SEC,
  ): Promise<string | null> {
    if (!stored?.trim()) return null;
    const value = stored.trim();

    if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    if (!this.isS3ObjectKey(value)) return null;

    this.assertConfigured();

    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: value,
      }),
      { expiresIn: expiresInSec },
    );
  }

  isS3ObjectKey(value: string): boolean {
    return value.startsWith(`${this.prefix}/`);
  }

  async deleteObject(key: string): Promise<void> {
    if (!this.isS3ObjectKey(key)) return;
    this.assertConfigured();
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (err) {
      this.logger.warn(`Không xóa được S3 object ${key}`);
    }
  }

  private extensionFromMime(mimeType: string): string {
    if (mimeType.includes('png')) return 'png';
    if (mimeType.includes('webp')) return 'webp';
    return 'jpg';
  }
}
