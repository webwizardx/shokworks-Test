import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'jalvarado@shokworks.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
