# Exercise 3

## Descripción

Implementación completa de un endpoint para recibir archivos multipart/form-data con metadata JSON incrustada, incluyendo validaciones de tipo de archivo y estructura de datos.

## Implementación

### 1. Entidad Upload (`upload.entity.ts`)

```typescript
export class Upload {
  id: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  title: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Características:**

- Estructura completa para almacenar información del archivo
- Metadata personalizada (`title`, `tags`)
- Información del archivo (`filename`, `originalName`, `mimetype`, `size`)
- Timestamps automáticos

### 2. DTOs de Validación (`upload.dto.ts`)

#### ImageMetadataDto

```typescript
export class ImageMetadataDto {
  @ApiProperty({
    description: 'Title of the uploaded file',
    example: 'Mi archivo',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @ApiProperty({
    description: 'Tags for the uploaded file',
    example: ['tag1', 'tag2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
```

#### CreateImageUploadDto

```typescript
export class CreateImageUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file (jpg, png)',
  })
  image: Express.Multer.File;

  @ApiProperty({
    description: 'JSON string containing metadata',
    example: '{"title": "Mi archivo", "tags": ["tag1", "tag2"]}',
  })
  @ValidateNested()
  @Transform(({ value }) => {
    try {
      return plainToInstance(ImageMetadataDto, JSON.parse(value));
    } catch (error) {
      throw new BadRequestException('Invalid JSON format for metadata');
    }
  })
  metadata: ImageMetadataDto;
}
```

**Características:**

- Validación de título con mínimo 3 caracteres
- Validación de array de tags
- Transformación automática de JSON string a objeto
- Validación anidada con `@ValidateNested()`
- Manejo de errores de parsing JSON

### 3. Controlador de Upload (`upload.controller.ts`)

```typescript
@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiOperation({ summary: 'Upload an image file with metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateImageUploadDto })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: Upload,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file type or metadata',
  })
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /(jpeg|jpg|png)/, fallbackToMimetype: true })],
      }),
    )
    image: Express.Multer.File,
    @Body() payload: ImageUploadMetadataDto,
  ): Promise<Upload> {
    return this.uploadService.createUpload(image, payload.metadata);
  }
}
```

**Características:**

- Endpoint `POST /upload` requerido
- Interceptor `FileInterceptor` para manejo de archivos
- Validación de tipo de archivo con `FileTypeValidator`
- Soporte para `multipart/form-data`
- Documentación completa con Swagger

### 4. Servicio de Upload (`upload.service.ts`)

```typescript
@Injectable()
export class UploadService {
  #uploads: Upload[] = [];

  createUpload(file: Express.Multer.File, metadata: ImageMetadataDto): Upload {
    const upload: Upload = {
      id: this.#uploads.length + 1,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      title: metadata.title,
      tags: metadata.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.#uploads.push(upload);
    return upload;
  }

  findAll(): Upload[] {
    return this.#uploads;
  }
}
```

**Características:**

- Almacenamiento en memoria con array privado
- Generación automática de IDs
- Preservación de información completa del archivo
- Integración de metadata con datos del archivo

### 5. Módulo de Upload (`upload.module.ts`)

```typescript
@Module({
  imports: [],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
```

**Características:**

- Configuración modular independiente
- Inyección de dependencias automática
- Sin dependencias externas

## Endpoints Implementados

| Método | Endpoint  | Descripción                | Tipo de Datos       |
| ------ | --------- | -------------------------- | ------------------- |
| `POST` | `/upload` | Subir archivo con metadata | multipart/form-data |
| `GET`  | `/upload` | Obtener todos los uploads  | JSON                |

## Validaciones Implementadas

### Validación de Archivo

- **Tipo de archivo**: Solo imágenes (jpg, jpeg, png)
- **Validación**: Usando `FileTypeValidator` con regex `/(jpeg|jpg|png)/`
- **Fallback**: Validación por MIME type como respaldo

### Validación de Metadata

- **Título**: Mínimo 3 caracteres con `@MinLength(3)`
- **Tags**: Array de strings con validación individual
- **JSON**: Parsing y validación de estructura JSON
- **Transformación**: Conversión automática de string a objeto

## Flujo de Procesamiento

1. **Recepción**: Endpoint recibe `multipart/form-data`
2. **Validación de archivo**: Verifica tipo de imagen (jpg, png)
3. **Parsing de metadata**: Convierte JSON string a objeto
4. **Validación de datos**: Verifica estructura y reglas de negocio
5. **Almacenamiento**: Crea registro con información completa
6. **Respuesta**: Retorna objeto Upload con datos procesados
