import { Injectable } from '@nestjs/common';
import { ImageMetadataDto } from './dto/upload.dto';
import { Upload } from './entities/upload.entity';

@Injectable()
export class UploadService {
  #uploads: Upload[] = [];

  /**
   * Creates a new upload record
   * @param file - The uploaded file object
   * @param metadata - The parsed metadata
   * @author Jonathan Alvarado
   * @returns The created upload record
   */
  createUpload(file: Express.Multer.File, metadata: ImageMetadataDto): Upload {
    const upload: Upload = {
      id: this.#uploads.length + 1,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      title: metadata.title,
      tags: metadata.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.#uploads.push(upload);
    return upload;
  }

  /**
   * Gets all uploads
   * @author Jonathan Alvarado
   * @returns Array of all uploads
   */
  findAll(): Upload[] {
    return this.#uploads;
  }
}
