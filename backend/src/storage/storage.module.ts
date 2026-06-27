import { Module } from '@nestjs/common';
import { S3KycStorageService } from './s3-kyc.storage';

@Module({
  providers: [S3KycStorageService],
  exports: [S3KycStorageService],
})
export class StorageModule {}
