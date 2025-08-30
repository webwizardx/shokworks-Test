import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object when valid credentials are provided', async () => {
      const mockUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findOneByEmail.mockReturnValue(mockUser);

      const result = await service.validateUser('admin@example.com', 'password');

      expect(result).toBeDefined();
      expect(result.name).toBe('Admin User');
      expect(result.email).toBe('admin@example.com');
      expect(result.role).toBe('admin');
      expect(result.password).toBeUndefined();
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('admin@example.com');
    });

    it('should return null when invalid credentials are provided', async () => {
      const mockUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findOneByEmail.mockReturnValue(mockUser);

      const result = await service.validateUser('admin@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null when user does not exist', async () => {
      mockUsersService.findOneByEmail.mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });
  });

  describe('login', () => {
    it('should return access token and user info when valid credentials are provided', async () => {
      const loginDto: LoginDto = {
        email: 'admin@example.com',
        password: 'password',
      };

      const mockUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findOneByEmail.mockReturnValue(mockUser);
      const mockToken = 'mock.jwt.token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.access_token).toBe(mockToken);
      expect(result.user).toBeDefined();
      expect(result.user.name).toBe('Admin User');
      expect(result.user.email).toBe('admin@example.com');
      expect(result.user.role).toBe('admin');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      });
    });

    it('should throw UnauthorizedException when invalid credentials are provided', async () => {
      const loginDto: LoginDto = {
        email: 'admin@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findOneByEmail.mockReturnValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyToken', () => {
    it('should return payload when valid token is provided', async () => {
      const mockPayload = {
        sub: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };

      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.verifyToken('valid.token');

      expect(result).toEqual(mockPayload);
      expect(jwtService.verify).toHaveBeenCalledWith('valid.token');
    });

    it('should throw UnauthorizedException when invalid token is provided', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.verifyToken('invalid.token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
