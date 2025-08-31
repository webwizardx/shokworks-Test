import { ApiProperty } from '@nestjs/swagger';

export class TrackingStatsDto {
  @ApiProperty({
    description: 'Total number of access attempts recorded',
    example: 15,
  })
  totalAccesses: number;

  @ApiProperty({
    description: 'List of unique users who have accessed the system',
    example: ['admin', 'user1', 'user2'],
    type: [String],
  })
  uniqueUsers: string[];

  @ApiProperty({
    description: 'Username of the most recent user who accessed',
    example: 'user2',
    nullable: true,
  })
  lastUser: string | null;
}
