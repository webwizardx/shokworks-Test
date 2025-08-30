import { ApiResponseProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiResponseProperty({ example: 1 })
  id: number;

  @ApiResponseProperty({ example: 'Jonathan Alvarado' })
  name: string;

  @ApiResponseProperty({ example: 'jalvarado@shokworks.com' })
  email: string;

  @ApiResponseProperty({ example: 'admin' })
  role: string;
}

export class LoginResponseDto {
  @ApiResponseProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiResponseProperty({ type: LoginUserDto })
  user: LoginUserDto;
}
