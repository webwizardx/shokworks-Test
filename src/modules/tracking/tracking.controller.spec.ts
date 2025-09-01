import { Test, TestingModule } from '@nestjs/testing';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

describe('TrackingController', () => {
  let controller: TrackingController;
  let service: TrackingService;

  const mockTrackingService = {
    recordAccess: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackingController],
      providers: [
        {
          provide: TrackingService,
          useValue: mockTrackingService,
        },
      ],
    }).compile();

    controller = module.get<TrackingController>(TrackingController);
    service = module.get<TrackingService>(TrackingService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('trackAccess', () => {
    it('should record access and return success response', async () => {
      const mockUser = {
        name: 'testuser',
        id: '1',
        email: 'test@example.com',
        role: 'user',
      };

      const mockRequest = {
        user: mockUser,
      };

      const mockAccessLog = {
        id: 1,
        username: 'testuser',
        timestamp: new Date('2025-01-01T12:00:00Z'),
      };

      mockTrackingService.recordAccess.mockResolvedValue(mockAccessLog);

      const result = await controller.trackAccess(mockRequest);

      expect(service.recordAccess).toHaveBeenCalledWith('testuser');
      expect(result).toEqual({
        message: 'Access tracked successfully',
        username: 'testuser',
        timestamp: mockAccessLog.timestamp.toISOString(),
      });
    });

    it('should extract username from JWT payload correctly', async () => {
      const mockUser = {
        name: 'adminuser',
        id: '2',
        email: 'admin@example.com',
        role: 'admin',
      };

      const mockRequest = {
        user: mockUser,
      };

      const mockAccessLog = {
        id: 1,
        username: 'adminuser',
        timestamp: new Date(),
      };

      mockTrackingService.recordAccess.mockResolvedValue(mockAccessLog);

      await controller.trackAccess(mockRequest);

      expect(service.recordAccess).toHaveBeenCalledWith('adminuser');
    });

    it('should handle different usernames', async () => {
      const usernames = ['user1', 'user2', 'admin', 'testuser'];

      for (const username of usernames) {
        const mockRequest = {
          user: { name: username },
        };

        const mockAccessLog = {
          id: 1,
          username,
          timestamp: new Date(),
        };

        mockTrackingService.recordAccess.mockResolvedValue(mockAccessLog);

        await controller.trackAccess(mockRequest);

        expect(service.recordAccess).toHaveBeenCalledWith(username);
      }

      expect(service.recordAccess).toHaveBeenCalledTimes(4);
    });
  });

  describe('getStats', () => {
    it('should return tracking statistics', async () => {
      const mockStats = {
        totalAccesses: 5,
        uniqueUsers: ['user1', 'user2', 'admin'],
        lastUser: 'admin',
      };

      mockTrackingService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(service.getStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    it('should return empty stats when no accesses recorded', async () => {
      const mockStats = {
        totalAccesses: 0,
        uniqueUsers: [],
        lastUser: null,
      };

      mockTrackingService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result).toEqual(mockStats);
    });

    it('should return stats with single user', async () => {
      const mockStats = {
        totalAccesses: 3,
        uniqueUsers: ['singleuser'],
        lastUser: 'singleuser',
      };

      mockTrackingService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.totalAccesses).toBe(3);
      expect(result.uniqueUsers).toEqual(['singleuser']);
      expect(result.lastUser).toBe('singleuser');
    });
  });
});
