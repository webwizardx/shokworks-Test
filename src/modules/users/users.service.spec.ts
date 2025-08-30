import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    configService = module.get<ConfigService>(ConfigService);

    // Mock the jwt.salt configuration
    mockConfigService.get.mockReturnValue(10);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', () => {
      const result = service.findAll();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      // First create a user
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      await service.create(createUserDto);

      const result = service.findOne(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException for non-existent user', () => {
      expect(() => service.findOne(999)).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      const result = await service.create(createUserDto);
      expect(result).toBeDefined();
      expect(result.name).toBe(createUserDto.name);
      expect(result.email).toBe(createUserDto.email);
      expect(result.role).toBe(createUserDto.role);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create user with default role when not provided', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test2@example.com',
        password: 'password123',
      };

      const result = await service.create(createUserDto);
      expect(result.role).toBe(UserRole.USER);
    });

    it('should throw ConflictException for duplicate email', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      await service.create(createUserDto);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      // First create a user
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      await service.create(createUserDto);

      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const result = await service.update(1, updateUserDto);
      expect(result).toBeDefined();
      expect(result.name).toBe(updateUserDto.name);
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      await expect(service.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate email', async () => {
      // Create first user
      const createUserDto1: CreateUserDto = {
        name: 'Test User 1',
        email: 'test1@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      await service.create(createUserDto1);

      // Create second user
      const createUserDto2: CreateUserDto = {
        name: 'Test User 2',
        email: 'test2@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      await service.create(createUserDto2);

      const updateUserDto: UpdateUserDto = {
        email: 'test1@example.com', // Try to update to existing email
      };

      await expect(service.update(2, updateUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove an existing user', async () => {
      // First create a user
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      await service.create(createUserDto);

      const initialCount = service.findAll().length;
      const result = service.remove(1);
      const finalCount = service.findAll().length;

      expect(finalCount).toBe(initialCount - 1);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException for non-existent user', () => {
      expect(() => service.remove(999)).toThrow(NotFoundException);
    });
  });
});
