import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { TrackingStatsDto } from './dto/tracking-stats.dto';
import { AccessLog } from './entities/access-log.entity';

@Injectable()
export class TrackingService {
  constructor(
    @InjectModel(AccessLog)
    private readonly accessLogModel: typeof AccessLog,
  ) {}

  /**
   * Records an access from a user
   * @param username - The username extracted from JWT
   * @author Jonathan Alvarado
   */
  async recordAccess(username: string): Promise<AccessLog> {
    return await this.accessLogModel.create({
      username,
    });
  }

  /**
   * Gets tracking statistics
   * @author Jonathan Alvarado
   * @returns Object containing total accesses, unique users, and last user
   */
  async getStats(): Promise<TrackingStatsDto> {
    const totalAccesses = await this.accessLogModel.count();

    const uniqueUsersQuery = await this.accessLogModel.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('username')), 'username']],
    });

    const uniqueUsers = uniqueUsersQuery.map((log) => log.username);

    // Get the last user who accessed
    const lastAccess = await this.accessLogModel.findOne({
      order: [['timestamp', 'DESC']],
      attributes: ['username'],
    });
    const lastUser = lastAccess ? lastAccess.username : null;

    return {
      totalAccesses,
      uniqueUsers,
      lastUser,
    };
  }

  /**
   * Gets all access logs (for testing purposes)
   * @author Jonathan Alvarado
   * @returns Array of all access logs
   */
  async getAllAccessLogs(): Promise<AccessLog[]> {
    return await this.accessLogModel.findAll({
      order: [['timestamp', 'DESC']],
    });
  }

  /**
   * Clears all access logs (for testing purposes)
   * @author Jonathan Alvarado
   */
  async clearAccessLogs(): Promise<void> {
    await this.accessLogModel.destroy({
      where: {},
      truncate: true,
    });
  }
}
