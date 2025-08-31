import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateImageUploadDto, ImageUploadMetadataDto } from './dto/upload.dto';
import { Upload } from './entities/upload.entity';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiOperation({ summary: 'Upload an image file with metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateImageUploadDto })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: Upload,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file type or metadata',
  })
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /(jpeg|jpg|png)/, fallbackToMimetype: true })],
      }),
    )
    image: Express.Multer.File,
    @Body() payload: ImageUploadMetadataDto,
  ): Promise<Upload> {
    return this.uploadService.createUpload(image, payload.metadata);
  }

  @Get()
  @ApiOperation({ summary: 'Get all uploads' })
  @ApiResponse({
    status: 200,
    description: 'List of all uploads',
    type: [Upload],
  })
  findAll(): Upload[] {
    return this.uploadService.findAll();
  }
}
