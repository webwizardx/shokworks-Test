import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: Omit<User, 'password'> = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
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
        password: 'password123',
        role: UserRole.USER,
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toBeDefined();
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', () => {
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockReturnValue(mockUsers);

      const result = controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', () => {
      const userId = 1;
      mockUsersService.findOne.mockReturnValue(mockUser);

      const result = controller.findOne(userId);

      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toBeDefined();
      expect(result.name).toBe(updateUserDto.name);
    });
  });

  describe('remove', () => {
    it('should remove a user', () => {
      const userId = 1;
      mockUsersService.remove.mockReturnValue(mockUser);

      const result = controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(userId);
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
    });
  });
});
