import { Injectable } from '@nestjs/common';
import { TrackingStatsDto } from './dto/tracking-stats.dto';
import { AccessLog } from './entities/access-log.entity';

@Injectable()
export class TrackingService {
  #accessLogs: AccessLog[] = [];

  /**
   * Records an access from a user
   * @param username - The username extracted from JWT
   * @author Jonathan Alvarado
   */
  recordAccess(username: string): void {
    const accessLog: AccessLog = {
      username,
      timestamp: new Date(),
    };

    this.#accessLogs.push(accessLog);
  }

  /**
   * Gets tracking statistics
   * @author Jonathan Alvarado
   * @returns Object containing total accesses, unique users, and last user
   */
  getStats(): TrackingStatsDto {
    const totalAccesses = this.#accessLogs.length;

    // Get unique users using Set
    const uniqueUsers = [...new Set(this.#accessLogs.map((log) => log.username))];

    // Get the last user who accessed
    const lastUser = this.#accessLogs.length > 0 ? this.#accessLogs[this.#accessLogs.length - 1].username : null;

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
  getAllAccessLogs(): AccessLog[] {
    return [...this.#accessLogs];
  }

  /**
   * Clears all access logs (for testing purposes)
   * @author Jonathan Alvarado
   */
  clearAccessLogs(): void {
    this.#accessLogs = [];
  }
}
