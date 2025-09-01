import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

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
      controllers: [UsersController],
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

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    // Mock the jwt.salt configuration
    mockConfigService.get.mockReturnValue(10);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      const mockCreatedUser = {
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
        role: createUserDto.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the service method
      jest.spyOn(service, 'create').mockResolvedValue(mockCreatedUser as User);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockCreatedUser);
      expect(result.name).toBe(createUserDto.name);
      expect(result.email).toBe(createUserDto.email);
      expect(result.id).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@example.com', role: UserRole.USER },
        { id: 2, name: 'User 2', email: 'user2@example.com', role: UserRole.ADMIN },
      ];

      // Mock the service method
      jest.spyOn(service, 'findAll').mockResolvedValue(mockUsers as User[]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      // Mock the service method
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser as User);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Test User');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const mockUpdatedUser = {
        id: 1,
        name: 'Updated Name',
        email: 'test@example.com',
        role: UserRole.USER,
        updatedAt: new Date(),
      };

      // Mock the service method
      jest.spyOn(service, 'update').mockResolvedValue(mockUpdatedUser as User);

      const result = await controller.update(1, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(mockUpdatedUser);
      expect(result.name).toBe(updateUserDto.name);
      expect(result.id).toBe(1);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const mockDeletedUser = {
        id: 2,
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      // Mock the service method
      jest.spyOn(service, 'remove').mockResolvedValue(mockDeletedUser as User);

      const result = await controller.remove(2);

      expect(service.remove).toHaveBeenCalledWith(2);
      expect(result).toEqual(mockDeletedUser);
      expect(result.id).toBe(2);
    });
  });
});
