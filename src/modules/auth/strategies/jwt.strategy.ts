import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { GlobalConfig } from 'src/config/global';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService<GlobalConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret', { infer: true }) as string,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.name) {
      throw new ForbiddenException('Invalid token payload');
    }

    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  }
}
