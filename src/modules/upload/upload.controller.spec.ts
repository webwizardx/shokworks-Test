import { Test, TestingModule } from '@nestjs/testing';
import { ImageMetadataDto } from './dto/upload.dto';
import { Upload } from './entities/upload.entity';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  const mockUpload: Upload = {
    id: 1,
    filename: 'test-image.jpg',
    originalName: 'test-image.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    title: 'Test Image',
    tags: ['test', 'image'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: {
            createUpload: jest.fn().mockResolvedValue(mockUpload),
            findAll: jest.fn().mockResolvedValue([mockUpload]),
          },
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should create an upload successfully', async () => {
      const result = await controller.uploadFile(mockFile, { metadata: mockMetadata });

      expect(service.createUpload).toHaveBeenCalledWith(mockFile, mockMetadata);
      expect(result).toEqual(mockUpload);
    });

    it('should handle service errors', async () => {
      jest.spyOn(service, 'createUpload').mockRejectedValue(new Error('Service error') as never);

      await expect(controller.uploadFile(mockFile, { metadata: mockMetadata })).rejects.toThrow('Service error');
    });
  });

  describe('findAll', () => {
    it('should return all uploads', () => {
      jest.spyOn(service, 'findAll').mockReturnValue([mockUpload]);

      const result = controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUpload]);
    });

    it('should return empty array when no uploads exist', () => {
      jest.spyOn(service, 'findAll').mockReturnValue([]);

      const result = controller.findAll();

      expect(result).toEqual([]);
    });
  });
});
