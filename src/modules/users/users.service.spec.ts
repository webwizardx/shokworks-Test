import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: typeof User;

  const mockUserModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<typeof User>(getModelToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@example.com', role: UserRole.USER },
        { id: 2, name: 'User 2', email: 'user2@example.com', role: UserRole.ADMIN },
      ];
      mockUserModel.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockUsers);
      expect(mockUserModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', role: UserRole.USER };
      mockUserModel.findByPk.mockResolvedValue(mockUser);

      const result = await service.findOne(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const mockCreatedUser = {
        id: 1,
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(createUserDto);
      expect(result).toBeDefined();
      expect(result.name).toBe(createUserDto.name);
      expect(result.email).toBe(createUserDto.email);
      expect(result.role).toBe(createUserDto.role);
      expect(result.id).toBeDefined();
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should create user with default role when not provided', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test2@example.com',
        role: UserRole.USER,
      };

      const mockCreatedUser = {
        id: 1,
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(createUserDto);
      expect(result.role).toBe(UserRole.USER);
      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException for duplicate email', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'admin@example.com',
        role: UserRole.USER,
      };

      const existingUser = { id: 1, email: 'admin@example.com' };
      mockUserModel.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
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

      mockUserModel.findByPk.mockResolvedValue(mockUser);

      const result = await service.update(1, updateUserDto);
      expect(result).toBeDefined();
      expect(result.name).toBe(updateUserDto.name);
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.update).toHaveBeenCalledWith(updateUserDto);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(999);
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

      mockUserModel.findByPk.mockResolvedValue(mockUser);
      mockUserModel.findOne.mockResolvedValue(existingUser);

      await expect(service.update(1, updateUserDto)).rejects.toThrow(ConflictException);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { email: updateUserDto.email } });
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

      mockUserModel.findByPk.mockResolvedValue(mockUser);

      const result = await service.remove(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(999);
    });
  });
});
