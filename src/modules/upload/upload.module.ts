import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
