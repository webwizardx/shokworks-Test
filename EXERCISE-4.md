# Exercise 4

## Descripción

Implementación completa de un sistema de seguimiento de accesos usando datos extraídos de JWT, con persistencia temporal y estadísticas en tiempo real.

## Implementación

### 1. Entidad AccessLog (`access-log.entity.ts`)

```typescript
@Table({
  tableName: 'access_logs',
  timestamps: true,
})
export class AccessLog extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare username: string;

  @CreatedAt
  declare timestamp: Date;
}
```

**Características:**

- Estructura simple para almacenar accesos
- Campo `username` extraído del JWT
- Timestamp automático con `@CreatedAt`
- Persistencia temporal en base de datos

### 2. Servicio de Tracking (`tracking.service.ts`)

```typescript
@Injectable()
export class TrackingService {
  constructor(
    @InjectModel(AccessLog)
    private readonly accessLogModel: typeof AccessLog,
  ) {}

  async recordAccess(username: string): Promise<AccessLog> {
    return await this.accessLogModel.create({
      username,
    });
  }

  async getStats(): Promise<TrackingStatsDto> {
    const totalAccesses = await this.accessLogModel.count();

    const uniqueUsersQuery = await this.accessLogModel.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('username')), 'username']],
    });

    const uniqueUsers = uniqueUsersQuery.map((log) => log.username);

    const lastAccess = await this.accessLogModel.findOne({
      order: [['timestamp', 'DESC']],
      attributes: ['username'],
    });
    const lastUser = lastAccess ? lastAccess.username : null;

    return {
      totalAccesses,
      uniqueUsers,
      lastUser,
    };
  }
}
```

**Características:**

- Registro de accesos con username del JWT
- Cálculo de estadísticas en tiempo real
- Consultas optimizadas con Sequelize

### 3. Controlador de Tracking (`tracking.controller.ts`)

```typescript
@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('track')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track user access' })
  @ApiResponse({
    status: 201,
    description: 'Access tracked successfully',
    type: TrackAccessResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Invalid or missing token',
  })
  async trackAccess(@Request() req): Promise<TrackAccessResponseDto> {
    const { name: username } = req.user;

    const accessLog = await this.trackingService.recordAccess(username);

    return {
      message: 'Access tracked successfully',
      username,
      timestamp: accessLog.timestamp.toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get tracking statistics' })
  @ApiResponse({
    status: 200,
    description: 'Tracking statistics retrieved successfully',
    type: TrackingStatsDto,
  })
  async getStats(): Promise<TrackingStatsDto> {
    return await this.trackingService.getStats();
  }
}
```

**Características:**

- Endpoint `/track` protegido con JWT Guard
- Extracción del campo `name` del payload JWT
- Endpoint `/stats` público para consultar estadísticas
- Documentación completa con Swagger

### 4. DTOs de Respuesta

#### TrackingStatsDto

```typescript
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
```

#### TrackAccessResponseDto

```typescript
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
```

**Características:**

- Estructura tipada para respuestas
- Documentación automática con Swagger
- Ejemplos claros para cada campo
- Manejo de valores nulos

### 5. Módulo de Tracking (`tracking.module.ts`)

```typescript
@Module({
  imports: [SequelizeModule.forFeature([AccessLog])],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
```

**Características:**

- Configuración de Sequelize para la entidad AccessLog
- Exportación del servicio para uso externo
- Integración modular con el sistema

## Endpoints Implementados

| Método | Endpoint | Descripción                    | Protección |
| ------ | -------- | ------------------------------ | ---------- |
| `POST` | `/track` | Registrar acceso de usuario    | JWT Guard  |
| `GET`  | `/stats` | Obtener estadísticas de acceso | No         |

## Flujo de Seguimiento

1. **Autenticación**: Usuario envía token JWT válido
2. **Extracción**: Sistema extrae campo `name` del payload JWT
3. **Registro**: Se guarda acceso con username y timestamp
4. **Respuesta**: Se confirma el registro exitoso
5. **Estadísticas**: Endpoint público permite consultar métricas

## Integración con JWT

### Extracción de Datos

```typescript
// Del JWT Strategy (auth/strategies/jwt.strategy.ts)
async validate(payload: JwtPayload) {
  if (!payload.sub || !payload.name) {
    throw new ForbiddenException('Invalid token payload');
  }

  return {
    id: payload.sub,
    name: payload.name,  // ← Campo extraído para tracking
    email: payload.email,
    role: payload.role,
  };
}
```

### Uso en Controlador

```typescript
async trackAccess(@Request() req): Promise<TrackAccessResponseDto> {
  const { name: username } = req.user;  // ← Extraído del JWT
  const accessLog = await this.trackingService.recordAccess(username);
  // ...
}
```

## Estructuras en Memoria

### Persistencia Temporal

- **Base de datos**: SQLite con Sequelize ORM
- **Tabla**: `access_logs` con timestamps automáticos

### Consultas Optimizadas

```typescript
// Total de accesos
const totalAccesses = await this.accessLogModel.count();

// Usuarios únicos
const uniqueUsersQuery = await this.accessLogModel.findAll({
  attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('username')), 'username']],
});

// Último usuario
const lastAccess = await this.accessLogModel.findOne({
  order: [['timestamp', 'DESC']],
  attributes: ['username'],
});
```

## Cálculo de Estadísticas

### Métricas Implementadas

- **Total de accesos**: Conteo simple de registros
- **Usuarios únicos**: Consulta DISTINCT optimizada
- **Último usuario**: Ordenamiento por timestamp descendente

### Lógica de Negocio

```typescript
return {
  totalAccesses, // Número total de accesos registrados
  uniqueUsers, // Array de usuarios únicos
  lastUser, // Usuario del acceso más reciente
};
```
