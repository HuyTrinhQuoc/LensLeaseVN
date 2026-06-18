import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { EkycService } from './ekyc.service';

@ApiTags('eKYC — Xác thực CCCD')
@Controller('ekyc')
export class EkycController {
  constructor(private readonly ekycService: EkycService) {}

  @Get('status')
  @ApiOperation({ summary: 'Trạng thái eKYC của user đang đăng nhập' })
  async status(@Headers() headers: Record<string, string>) {
    const userId = this.ekycService.resolveUserId(headers);
    const data = await this.ekycService.getStatus(userId);
    return { message: 'Lấy trạng thái eKYC thành công', data };
  }

  @Post('submit')
  @ApiOperation({
    summary: 'Gửi ảnh CCCD — OCR qua FPT.AI (server-side)',
    description:
      'Upload multipart: front + back. API key FPT không bao giờ gửi xuống client.',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'front', maxCount: 1 },
        { name: 'back', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 },
      },
    ),
  )
  async submit(
    @Headers() headers: Record<string, string>,
    @UploadedFiles()
    files: {
      front?: Express.Multer.File[];
      back?: Express.Multer.File[];
    },
  ) {
    const userId = this.ekycService.resolveUserId(headers);
    const front = files.front?.[0];
    const back = files.back?.[0];
    if (!front || !back) {
      throw new BadRequestException('Vui lòng tải đủ mặt trước và mặt sau CCCD');
    }

    const data = await this.ekycService.verifyAndSubmit(userId, front, back);
    return {
      message: 'Xác thực eKYC thành công. Bạn có thể tiếp tục đặt thuê.',
      data,
    };
  }
}
