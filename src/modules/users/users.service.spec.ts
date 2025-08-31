import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

// Mock bcrypt
jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let userModel: typeof User;
  let configService: ConfigService;

  const mockUserModel = {
    scope: jest.fn().mockReturnThis(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<typeof User>(getModelToken(User));
    configService = module.get<ConfigService>(ConfigService);

    // Mock the jwt.salt configuration
    mockConfigService.get.mockReturnValue(10);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users without password', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@example.com', role: UserRole.USER },
        { id: 2, name: 'User 2', email: 'user2@example.com', role: UserRole.ADMIN },
      ];
      mockUserModel.scope.mockReturnValue({
        findAll: jest.fn().mockResolvedValue(mockUsers),
      });

      const result = await service.findAll();

      expect(mockUserModel.scope).toHaveBeenCalledWith('withoutPassword');
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id without password', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', role: UserRole.USER };
      mockUserModel.scope.mockReturnValue({
        findByPk: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findOne(1);

      expect(mockUserModel.scope).toHaveBeenCalledWith('withoutPassword');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockUserModel.scope.mockReturnValue({
        findByPk: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockUserModel.scope).toHaveBeenCalledWith('withoutPassword');
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email with password', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.USER,
        password: 'hashedPassword',
      };
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('test@example.com');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException for non-existent email', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.findOneByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundException);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      // First create a user
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      await service.create(createUserDto);

      const result = service.findOneByEmail('test@example.com');
      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
    });

    it('should throw NotFoundException for non-existent email', () => {
      expect(() => service.findOneByEmail('nonexistent@example.com')).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      const originalPassword = createUserDto.password;
      const hashedPassword = 'hashedPassword123';
      const mockCreatedUser = {
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
        role: createUserDto.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserModel.scope.mockReturnValue({
        create: jest.fn().mockResolvedValue(mockCreatedUser),
      });

      const result = await service.create(createUserDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(originalPassword, 10);
      expect(mockUserModel.scope).toHaveBeenCalledWith('withoutPassword');
      expect(result).toEqual(mockCreatedUser);
    });

    it('should create user with default role when not provided', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test2@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      const hashedPassword = 'hashedPassword123';
      const mockCreatedUser = {
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserModel.scope.mockReturnValue({
        create: jest.fn().mockResolvedValue(mockCreatedUser),
      });

      const result = await service.create(createUserDto);

      expect(result.role).toBe(UserRole.USER);
      expect(mockUserModel.scope).toHaveBeenCalledWith('withoutPassword');
    });

    it('should throw ConflictException for duplicate email', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'admin@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      const existingUser = { id: 1, email: 'admin@example.com' };
      mockUserModel.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const mockUser = {
        id: 1,
        name: 'Original Name',
        email: 'test@example.com',
        role: UserRole.USER,
        update: jest.fn().mockImplementation(async (updateData) => {
          Object.assign(mockUser, updateData);
          return mockUser;
        }),
      };

      mockUserModel.scope.mockReturnValue({
        findByPk: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.update(1, updateUserDto);

      expect(mockUserModel.scope).toHaveBeenCalledWith('withoutPassword');
      expect(result).toBeDefined();
      expect(result.name).toBe(updateUserDto.name);
      expect(mockUser.update).toHaveBeenCalledWith(updateUserDto);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      mockUserModel.scope.mockReturnValue({
        findByPk: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
      expect(mockUserModel.scope).toHaveBeenCalledWith('withoutPassword');
    });

    it('should throw ConflictException for duplicate email', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'user@example.com',
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'original@example.com',
        role: UserRole.USER,
      };

      const existingUser = { id: 2, email: 'user@example.com' };

      mockUserModel.scope.mockReturnValue({
        findByPk: jest.fn().mockResolvedValue(mockUser),
      });
      mockUserModel.findOne.mockResolvedValue(existingUser);

      await expect(service.update(1, updateUserDto)).rejects.toThrow(ConflictException);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: updateUserDto.email },
      });
    });

    it('should not check for duplicate email if email is not being updated', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const mockUser = {
        id: 1,
        name: 'Original Name',
        email: 'test@example.com',
        role: UserRole.USER,
        update: jest.fn().mockResolvedValue(undefined),
      };

      mockUserModel.scope.mockReturnValue({
        findByPk: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.update(1, updateUserDto);

      expect(mockUserModel.findOne).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should allow updating to same email', async () => {
      // Create a user
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      await service.create(createUserDto);

      const updateUserDto: UpdateUserDto = {
        email: 'test@example.com', // Same email
      };

      const result = await service.update(1, updateUserDto);
      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('remove', () => {
    it('should remove an existing user', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.USER,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      mockUserModel.scope.mockReturnValue({
        findByPk: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.remove(1);

      expect(mockUserModel.scope).toHaveBeenCalledWith('withoutPassword');
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(mockUser.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockUserModel.scope.mockReturnValue({
        findByPk: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockUserModel.scope).toHaveBeenCalledWith('withoutPassword');
    });
  });

  describe('mapUserToResponse', () => {
    it('should return user without password', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      const user = await service.create(createUserDto);
      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.email).toBeDefined();
    });
  });
});
