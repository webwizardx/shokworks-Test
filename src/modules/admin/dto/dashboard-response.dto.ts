import { ApiResponseProperty } from '@nestjs/swagger';

export class DashboardUserDto {
  @ApiResponseProperty({ example: '1' })
  id: string;

  @ApiResponseProperty({ example: 'Admin User' })
  name: string;

  @ApiResponseProperty({ example: 'admin@example.com' })
  email: string;

  @ApiResponseProperty({ example: 'admin' })
  role: string;
}

export class DashboardResponseDto {
  @ApiResponseProperty({
    example: 'Welcome to the admin dashboard, Admin User!',
  })
  message: string;

  @ApiResponseProperty({ type: DashboardUserDto })
  user: DashboardUserDto;

  @ApiResponseProperty({
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;
}
