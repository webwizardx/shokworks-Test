import { ApiProperty } from '@nestjs/swagger';

export class TrackAccessResponseDto {
  @ApiProperty({
    description: 'Success message confirming the access was tracked',
    example: 'Access tracked successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Username of the user whose access was recorded',
    example: 'admin',
  })
  username: string;

  @ApiProperty({
    description: 'ISO timestamp when the access was recorded',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;
}
