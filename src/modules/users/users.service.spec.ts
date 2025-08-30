import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', () => {
      const result = service.findAll();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', () => {
      const result = service.findOne(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException for non-existent user', () => {
      expect(() => service.findOne(999)).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user', () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const result = service.create(createUserDto);
      expect(result).toBeDefined();
      expect(result.name).toBe(createUserDto.name);
      expect(result.email).toBe(createUserDto.email);
      expect(result.role).toBe(createUserDto.role);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create user with default role when not provided', () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test2@example.com',
      };

      const result = service.create(createUserDto);
      expect(result.role).toBe(UserRole.USER);
    });

    it('should throw ConflictException for duplicate email', () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'admin@example.com', // This email already exists
        role: UserRole.USER,
      };

      expect(() => service.create(createUserDto)).toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update an existing user', () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const result = service.update(1, updateUserDto);
      expect(result).toBeDefined();
      expect(result.name).toBe(updateUserDto.name);
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw NotFoundException for non-existent user', () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      expect(() => service.update(999, updateUserDto)).toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate email', () => {
      const updateUserDto: UpdateUserDto = {
        email: 'user@example.com', // This email already exists
      };

      expect(() => service.update(1, updateUserDto)).toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove an existing user', () => {
      const initialCount = service.findAll().length;
      service.remove(1);
      const finalCount = service.findAll().length;
      expect(finalCount).toBe(initialCount - 1);
    });

    it('should throw NotFoundException for non-existent user', () => {
      expect(() => service.remove(999)).toThrow(NotFoundException);
    });
  });
});
