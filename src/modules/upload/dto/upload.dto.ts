import { BadRequestException } from '@nestjs/common';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { plainToInstance, Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';
import { HasMimeType, IsFile } from 'nestjs-form-data';

export class ImageMetadataDto {
  @ApiProperty({
    description: 'Title of the uploaded file',
    example: 'Mi archivo',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @ApiProperty({
    description: 'Tags for the uploaded file',
    example: ['tag1', 'tag2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

export class CreateImageUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file (jpg, png)',
  })
  @IsFile()
  @HasMimeType(['image/jpg', 'image/png'])
  image: Express.Multer.File;

  @ApiProperty({
    description: 'JSON string containing metadata',
    example: '{"title": "Mi archivo", "tags": ["tag1", "tag2"]}',
  })
  @ValidateNested()
  @Transform(({ value }) => {
    try {
      return plainToInstance(ImageMetadataDto, JSON.parse(value));
    } catch (error) {
      throw new BadRequestException('Invalid JSON format for metadata');
    }
  })
  metadata: ImageMetadataDto;
}

export class ImageUploadMetadataDto extends PickType(CreateImageUploadDto, ['metadata']) {}
