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
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
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
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
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

      const result = await controller.create(createUserDto);
      expect(result).toBeDefined();
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
      mockUserModel.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', role: UserRole.USER };
      mockUserModel.findByPk.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('Test User');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
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

      const result = await controller.update(1, updateUserDto);
      expect(result).toBeDefined();
      expect(result.name).toBe(updateUserDto.name);
      expect(result.id).toBe(1);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const mockUser = {
        id: 2,
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.USER,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      mockUserModel.findByPk.mockResolvedValue(mockUser);

      const result = await controller.remove(2);
      expect(result).toBeDefined();
      expect(result.id).toBe(2);
      expect(mockUser.destroy).toHaveBeenCalled();
    });
  });
});
