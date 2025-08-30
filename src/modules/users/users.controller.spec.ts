import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const result = controller.create(createUserDto);
      expect(result).toBeDefined();
      expect(result.name).toBe(createUserDto.name);
      expect(result.email).toBe(createUserDto.email);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', () => {
      const result = controller.findAll();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', () => {
      const result = controller.findOne(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });
  });

  describe('update', () => {
    it('should update a user', () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const result = controller.update(1, updateUserDto);
      expect(result).toBeDefined();
      expect(result.name).toBe(updateUserDto.name);
    });
  });

  describe('remove', () => {
    it('should remove a user', () => {
      const initialCount = service.findAll().length;
      controller.remove(2);
      const finalCount = service.findAll().length;
      expect(finalCount).toBe(initialCount - 1);
    });
  });
});
