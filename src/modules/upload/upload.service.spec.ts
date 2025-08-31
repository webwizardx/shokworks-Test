import { Test, TestingModule } from '@nestjs/testing';
import { ImageMetadataDto } from './dto/upload.dto';
import { Upload } from './entities/upload.entity';
import { UploadService } from './upload.service';

describe('UploadService', () => {
  let service: UploadService;

  const mockFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    stream: null as any,
    destination: './uploads',
    filename: 'test-image.jpg',
    path: './uploads/test-image.jpg',
    buffer: Buffer.from('test'),
  };

  const mockMetadata: ImageMetadataDto = {
    title: 'Test Image',
    tags: ['test', 'image'],
  };

  const expectedUpload: Upload = {
    id: 1,
    filename: 'test-image.jpg',
    originalName: 'test-image.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    title: 'Test Image',
    tags: ['test', 'image'],
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUpload', () => {
    it('should create an upload successfully', () => {
      const result = service.createUpload(mockFile, mockMetadata);

      expect(result).toEqual(expectedUpload);
    });

    it('should increment ID for multiple uploads', () => {
      const firstUpload = service.createUpload(mockFile, mockMetadata);
      const secondUpload = service.createUpload(
        { ...mockFile, filename: 'second-image.jpg', originalname: 'second-image.jpg' },
        { ...mockMetadata, title: 'Second Image' },
      );

      expect(firstUpload.id).toBe(1);
      expect(secondUpload.id).toBe(2);
    });

    it('should set correct file properties', () => {
      const result = service.createUpload(mockFile, mockMetadata);

      expect(result.filename).toBe(mockFile.filename);
      expect(result.originalName).toBe(mockFile.originalname);
      expect(result.mimetype).toBe(mockFile.mimetype);
      expect(result.size).toBe(mockFile.size);
    });

    it('should set correct metadata properties', () => {
      const result = service.createUpload(mockFile, mockMetadata);

      expect(result.title).toBe(mockMetadata.title);
      expect(result.tags).toEqual(mockMetadata.tags);
    });

    it('should set timestamps', () => {
      const beforeCreate = new Date();
      const result = service.createUpload(mockFile, mockMetadata);
      const afterCreate = new Date();

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe('findAll', () => {
    it('should return empty array initially', () => {
      const result = service.findAll();

      expect(result).toEqual([]);
    });

    it('should return all created uploads', () => {
      const firstUpload = service.createUpload(mockFile, mockMetadata);
      const secondUpload = service.createUpload(
        { ...mockFile, filename: 'second-image.jpg', originalname: 'second-image.jpg' },
        { ...mockMetadata, title: 'Second Image' },
      );

      const result = service.findAll();

      expect(result).toHaveLength(2);
      expect(result).toContain(firstUpload);
      expect(result).toContain(secondUpload);
    });

    it('should return uploads in creation order', () => {
      const firstUpload = service.createUpload(mockFile, mockMetadata);
      const secondUpload = service.createUpload(
        { ...mockFile, filename: 'second-image.jpg', originalname: 'second-image.jpg' },
        { ...mockMetadata, title: 'Second Image' },
      );

      const result = service.findAll();

      expect(result[0]).toBe(firstUpload);
      expect(result[1]).toBe(secondUpload);
    });
  });
});
