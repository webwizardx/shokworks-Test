import { Test, TestingModule } from '@nestjs/testing';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingService],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordAccess', () => {
    it('should record an access with username and timestamp', () => {
      const username = 'testuser';
      const beforeRecord = new Date();

      service.recordAccess(username);

      const logs = service.getAllAccessLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].username).toBe(username);
      expect(logs[0].timestamp).toBeInstanceOf(Date);
      expect(logs[0].timestamp.getTime()).toBeGreaterThanOrEqual(beforeRecord.getTime());
    });

    it('should record multiple accesses in order', () => {
      const usernames = ['user1', 'user2', 'user3'];

      usernames.forEach((username) => {
        service.recordAccess(username);
      });

      const logs = service.getAllAccessLogs();
      expect(logs).toHaveLength(3);
      logs.forEach((log, index) => {
        expect(log.username).toBe(usernames[index]);
      });
    });

    it('should record same user multiple times', () => {
      const username = 'repeateduser';

      service.recordAccess(username);
      service.recordAccess(username);
      service.recordAccess(username);

      const logs = service.getAllAccessLogs();
      expect(logs).toHaveLength(3);
      logs.forEach((log) => {
        expect(log.username).toBe(username);
      });
    });
  });

  describe('getStats', () => {
    it('should return empty stats when no accesses recorded', () => {
      const stats = service.getStats();

      expect(stats).toEqual({
        totalAccesses: 0,
        uniqueUsers: [],
        lastUser: null,
      });
    });

    it('should return correct stats for single access', () => {
      const username = 'singleuser';
      service.recordAccess(username);

      const stats = service.getStats();

      expect(stats.totalAccesses).toBe(1);
      expect(stats.uniqueUsers).toEqual([username]);
      expect(stats.lastUser).toBe(username);
    });

    it('should return correct stats for multiple unique users', () => {
      const users = ['user1', 'user2', 'user3'];
      users.forEach((user) => service.recordAccess(user));

      const stats = service.getStats();

      expect(stats.totalAccesses).toBe(3);
      expect(stats.uniqueUsers).toEqual(users);
      expect(stats.lastUser).toBe('user3');
    });

    it('should return correct stats for repeated users', () => {
      // user1, user2, user1, user3, user2
      const accessSequence = ['user1', 'user2', 'user1', 'user3', 'user2'];
      accessSequence.forEach((user) => service.recordAccess(user));

      const stats = service.getStats();

      expect(stats.totalAccesses).toBe(5);
      expect(stats.uniqueUsers).toEqual(['user1', 'user2', 'user3']);
      expect(stats.lastUser).toBe('user2');
    });

    it('should maintain order of unique users based on first appearance', () => {
      // user2, user1, user3, user1, user2
      const accessSequence = ['user2', 'user1', 'user3', 'user1', 'user2'];
      accessSequence.forEach((user) => service.recordAccess(user));

      const stats = service.getStats();

      expect(stats.uniqueUsers).toEqual(['user2', 'user1', 'user3']);
    });
  });

  describe('getAllAccessLogs', () => {
    it('should return empty array initially', () => {
      const logs = service.getAllAccessLogs();

      expect(logs).toEqual([]);
    });

    it('should return all recorded access logs', () => {
      const usernames = ['user1', 'user2', 'user1'];
      usernames.forEach((user) => service.recordAccess(user));

      const logs = service.getAllAccessLogs();

      expect(logs).toHaveLength(3);
      logs.forEach((log, index) => {
        expect(log.username).toBe(usernames[index]);
        expect(log.timestamp).toBeInstanceOf(Date);
      });
    });

    it('should return a copy of the logs array', () => {
      service.recordAccess('testuser');
      const logs1 = service.getAllAccessLogs();
      const logs2 = service.getAllAccessLogs();

      expect(logs1).not.toBe(logs2); // Different array references
      expect(logs1).toEqual(logs2); // Same content
    });
  });

  describe('clearAccessLogs', () => {
    it('should clear all access logs', () => {
      service.recordAccess('user1');
      service.recordAccess('user2');

      service.clearAccessLogs();

      const logs = service.getAllAccessLogs();
      const stats = service.getStats();

      expect(logs).toEqual([]);
      expect(stats.totalAccesses).toBe(0);
      expect(stats.uniqueUsers).toEqual([]);
      expect(stats.lastUser).toBe(null);
    });

    it('should allow recording new accesses after clearing', () => {
      service.recordAccess('olduser');
      service.clearAccessLogs();
      service.recordAccess('newuser');

      const stats = service.getStats();

      expect(stats.totalAccesses).toBe(1);
      expect(stats.uniqueUsers).toEqual(['newuser']);
      expect(stats.lastUser).toBe('newuser');
    });
  });
});
