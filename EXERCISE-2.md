# Exercise 2

## Descripción

Implementación completa de autenticación mediante JSON Web Token (JWT) con información personalizada en el payload y endpoints protegidos.

## Implementación

### 1. Configuración JWT (`auth.module.ts`)

```typescript
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<GlobalConfig>) => ({
        secret: configService.get('jwt.secret', { infer: true }) as string,
        signOptions: {
          expiresIn: '1h',
          issuer: 'shokworks-api',
          audience: 'shokworks-users',
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

### 2. Payload JWT Personalizado (`jwt-payload.interface.ts`)

```typescript
export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
```

**Características:**

- Campo `name` requerido en el payload
- Información completa del usuario (`sub`, `email`, `role`)
- Timestamps automáticos (`iat`, `exp`)

### 3. Estrategia JWT (`jwt.strategy.ts`)

```typescript
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
```

**Características:**

- Extracción automática del token Bearer
- Validación del payload requerido
- Retorno del usuario autenticado
- Manejo de errores con excepciones HTTP

### 4. Guard de Autenticación (`jwt-auth.guard.ts`)

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new ForbiddenException('Access denied. Invalid or missing token.');
    }
    return user;
  }
}
```

**Características:**

- Extensión del AuthGuard de Passport
- Manejo personalizado de errores
- Respuesta 403 Forbidden para tokens inválidos
- Validación automática de autenticación

### 5. Servicio de Autenticación (`auth.service.ts`)

```typescript
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

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
}
```

**Características:**

- Validación de credenciales con bcrypt
- Generación de token JWT con payload personalizado
- Manejo de errores de autenticación
- Retorno de token y datos del usuario

### 6. Controlador de Autenticación (`auth.controller.ts`)

```typescript
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login to get JWT token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

**Características:**

- Endpoint `POST /auth/login` requerido
- Documentación completa con Swagger
- Validación de entrada con DTOs
- Códigos de estado HTTP apropiados

### 7. Endpoint Protegido (`admin.controller.ts`)

```typescript
@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  @Get('dashboard')
  @ApiOperation({ summary: 'Protected admin dashboard endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Access granted - Welcome message with user name',
    type: DashboardResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Invalid or missing token',
  })
  getDashboard(@Request() req) {
    const user = req.user;

    return {
      message: `Welcome to the admin dashboard, ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
```

**Características:**

- Endpoint `GET /admin/dashboard` protegido
- Uso del guard JWT para validación
- Mensaje personalizado con el nombre del usuario
- Documentación Swagger con autenticación Bearer

### 8. DTOs de Autenticación

#### LoginDto

```typescript
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
```

#### LoginResponseDto

```typescript
export class LoginResponseDto {
  @ApiResponseProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiResponseProperty({ type: LoginUserDto })
  user: LoginUserDto;
}
```

**Características:**

- Validación de entrada con class-validator
- Documentación automática con Swagger
- Estructura de respuesta tipada
- Ejemplos para documentación

## Endpoints Implementados

| Método | Endpoint           | Descripción                                   | Protección |
| ------ | ------------------ | --------------------------------------------- | ---------- |
| `POST` | `/auth/login`      | Autenticación y generación de token JWT       | No         |
| `GET`  | `/admin/dashboard` | Dashboard protegido con mensaje personalizado | JWT Guard  |

## Flujo de Autenticación

1. **Login**: Usuario envía credenciales a `/auth/login`
2. **Validación**: Sistema valida email/password con bcrypt
3. **Generación**: Se crea token JWT con payload personalizado
4. **Respuesta**: Se retorna token y datos del usuario
5. **Protección**: Endpoints protegidos validan token Bearer
6. **Acceso**: Si es válido, se incluye información del usuario en `req.user`

## Configuración de Variables de Entorno

```env
JWT_SECRET=your-secret-key-here
JWT_SALT=10
NODE_ENV=development
PORT=3000
```
