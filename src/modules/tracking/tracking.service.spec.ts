import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessLog } from './entities/access-log.entity';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;
  let accessLogModel: typeof AccessLog;

  const mockAccessLogModel = {
    create: jest.fn(),
    count: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
    sequelize: {
      fn: jest.fn(),
      col: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        {
          provide: getModelToken(AccessLog),
          useValue: mockAccessLogModel,
        },
      ],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
    accessLogModel = module.get<typeof AccessLog>(getModelToken(AccessLog));

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordAccess', () => {
    it('should record an access with username and timestamp', async () => {
      const username = 'testuser';
      const mockAccessLog = {
        id: 1,
        username,
        timestamp: new Date(),
      };

      mockAccessLogModel.create.mockResolvedValue(mockAccessLog);

      const result = await service.recordAccess(username);

      expect(mockAccessLogModel.create).toHaveBeenCalledWith({
        username,
      });
      expect(result).toEqual(mockAccessLog);
    });

    it('should record multiple accesses in order', async () => {
      const usernames = ['user1', 'user2', 'user3'];
      const mockAccessLogs = usernames.map((username, index) => ({
        id: index + 1,
        username,
        timestamp: new Date(),
      }));

      mockAccessLogModel.create
        .mockResolvedValueOnce(mockAccessLogs[0])
        .mockResolvedValueOnce(mockAccessLogs[1])
        .mockResolvedValueOnce(mockAccessLogs[2]);

      for (const username of usernames) {
        await service.recordAccess(username);
      }

      expect(mockAccessLogModel.create).toHaveBeenCalledTimes(3);
      usernames.forEach((username, index) => {
        expect(mockAccessLogModel.create).toHaveBeenNthCalledWith(index + 1, {
          username,
        });
      });
    });
  });

  describe('getStats', () => {
    it('should return empty stats when no accesses recorded', async () => {
      mockAccessLogModel.count.mockResolvedValue(0);
      mockAccessLogModel.findAll.mockResolvedValue([]);
      mockAccessLogModel.findOne.mockResolvedValue(null);

      const stats = await service.getStats();

      expect(stats).toEqual({
        totalAccesses: 0,
        uniqueUsers: [],
        lastUser: null,
      });
    });

    it('should return correct stats for single access', async () => {
      const username = 'singleuser';
      mockAccessLogModel.count.mockResolvedValue(1);
      mockAccessLogModel.findAll.mockResolvedValue([{ username }]);
      mockAccessLogModel.findOne.mockResolvedValue({ username });

      const stats = await service.getStats();

      expect(stats.totalAccesses).toBe(1);
      expect(stats.uniqueUsers).toEqual([username]);
      expect(stats.lastUser).toBe(username);
    });

    it('should return correct stats for multiple unique users', async () => {
      const users = ['user1', 'user2', 'user3'];
      mockAccessLogModel.count.mockResolvedValue(3);
      mockAccessLogModel.findAll.mockResolvedValue(users.map((username) => ({ username })));
      mockAccessLogModel.findOne.mockResolvedValue({ username: 'user3' });

      const stats = await service.getStats();

      expect(stats.totalAccesses).toBe(3);
      expect(stats.uniqueUsers).toEqual(users);
      expect(stats.lastUser).toBe('user3');
    });

    it('should return correct stats for repeated users', async () => {
      const uniqueUsers = ['user1', 'user2', 'user3'];
      mockAccessLogModel.count.mockResolvedValue(5);
      mockAccessLogModel.findAll.mockResolvedValue(uniqueUsers.map((username) => ({ username })));
      mockAccessLogModel.findOne.mockResolvedValue({ username: 'user2' });

      const stats = await service.getStats();

      expect(stats.totalAccesses).toBe(5);
      expect(stats.uniqueUsers).toEqual(uniqueUsers);
      expect(stats.lastUser).toBe('user2');
    });
  });

  describe('getAllAccessLogs', () => {
    it('should return empty array initially', async () => {
      mockAccessLogModel.findAll.mockResolvedValue([]);

      const logs = await service.getAllAccessLogs();

      expect(logs).toEqual([]);
      expect(mockAccessLogModel.findAll).toHaveBeenCalledWith({
        order: [['timestamp', 'DESC']],
      });
    });

    it('should return all recorded access logs', async () => {
      const mockLogs = [
        { id: 1, username: 'user1', timestamp: new Date() },
        { id: 2, username: 'user2', timestamp: new Date() },
        { id: 3, username: 'user1', timestamp: new Date() },
      ];

      mockAccessLogModel.findAll.mockResolvedValue(mockLogs);

      const logs = await service.getAllAccessLogs();

      expect(logs).toEqual(mockLogs);
      expect(mockAccessLogModel.findAll).toHaveBeenCalledWith({
        order: [['timestamp', 'DESC']],
      });
    });
  });

  describe('clearAccessLogs', () => {
    it('should clear all access logs', async () => {
      mockAccessLogModel.destroy.mockResolvedValue(undefined);

      await service.clearAccessLogs();

      expect(mockAccessLogModel.destroy).toHaveBeenCalledWith({
        where: {},
        truncate: true,
      });
    });
  });
});
