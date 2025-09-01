# Exercise 1

## Descripción

Implementación completa de un CRUD básico para manejar usuarios usando NestJS con todas las funcionalidades requeridas.

## Implementación

### 1. Entidad User (`user.entity.ts`)

```typescript
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
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
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.USER,
  })
  declare role: UserRole;
}
```

**Características:**

- Usa Sequelize ORM con decoradores TypeScript
- Campos requeridos: `id`, `name`, `email`, `role`
- Validación de roles mediante enum (`admin`, `user`)
- Email único en la base de datos
- Timestamps automáticos (`createdAt`, `updatedAt`)

### 2. DTOs (Data Transfer Objects)

#### CreateUserDto

```typescript
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
  role: UserRole = UserRole.USER;
}
```

#### UpdateUserDto

```typescript
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

**Características:**

- Validación con `class-validator`
- Documentación automática con Swagger
- Herencia de tipos para reutilización
- Validación de email y roles

### 3. Servicio (`users.service.ts`)

Implementa toda la lógica de negocio:

- **`findAll()`**: Obtiene todos los usuarios
- **`findOne(id)`**: Busca usuario por ID con validación de existencia
- **`create(createUserDto)`**: Crea usuario con validación de email único
- **`update(id, updateUserDto)`**: Actualiza usuario con validaciones
- **`remove(id)`**: Elimina usuario con validación de existencia

**Características:**

- Inyección de dependencias con `@Injectable()`
- Manejo de excepciones personalizadas (`NotFoundException`, `ConflictException`)
- Validación de email único en creación y actualización
- Uso de Sequelize para operaciones de base de datos

### 4. Controlador (`users.controller.ts`)

Implementa todos los endpoints requeridos:

| Método   | Endpoint     | Descripción                  |
| -------- | ------------ | ---------------------------- |
| `GET`    | `/users`     | Obtener todos los usuarios   |
| `GET`    | `/users/:id` | Obtener usuario por ID       |
| `POST`   | `/users`     | Crear nuevo usuario          |
| `PUT`    | `/users/:id` | Actualizar usuario existente |
| `DELETE` | `/users/:id` | Eliminar usuario             |

**Características:**

- Documentación completa con Swagger
- Validación de parámetros con `ParseIntPipe`
- Códigos de estado HTTP apropiados
- Manejo de errores consistente

### 5. Módulo (`users.module.ts`)

```typescript
@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

**Características:**

- Configuración de Sequelize para la entidad User
- Exportación del servicio para uso en otros módulos
- Inyección de dependencias automática
