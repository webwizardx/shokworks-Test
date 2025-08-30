import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User, UserRole } from '../entities/user.entity';

export class CreateUserDto extends PickType(User, ['name', 'email']) {
  @ApiProperty({
    description: 'Name of the user',
    example: 'Jonathan Alvarado',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'jalvarado@shokworks.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Role of the user',
    enum: UserRole,
    example: UserRole.USER,
    default: UserRole.USER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER;
}
