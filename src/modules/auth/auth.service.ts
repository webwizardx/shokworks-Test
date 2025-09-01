import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  /**
   *  This method validates the user credentials
   * @param email - The email of the user
   * @param password - The password of the user
   * @author Jonathan Alvarado
   * @returns The user object if the credentials are valid, otherwise null
   */
  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findOneByEmail(email);

      if (user && (await bcrypt.compare(password, user.password))) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }
  }

  /**
   * This method logs in a user
   * @param loginDto - The login dto
   * @author Jonathan Alvarado
   * @returns The user object if the credentials are valid, otherwise null
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * This method verifies a token
   * @param token - The token to verify
   * @author Jonathan Alvarado
   * @returns The token payload
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
