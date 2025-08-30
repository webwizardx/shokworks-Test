# Shokworks Technical Assessment - Backend

Este proyecto contiene los 5 ejercicios prácticos del test técnico de backend para Shokworks, desarrollado con NestJS.

## 📋 Requisitos Previos

- Node.js (versión 20 o superior)
- npm o yarn
- Git

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio-url>
cd backend-technical-assessment
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno (opcional)

Crea un archivo `.env` en la raíz del proyecto si necesitas configuraciones específicas:

```bash
PORT=3000
NODE_ENV=development
```

## 🏃‍♂️ Ejecutar el Proyecto

### Desarrollo

```bash
npm run start:dev
```

### Producción

```bash
npm run build
npm run start:prod
```

### Solo compilación

```bash
npm run build
```

## 📚 Documentación de la API

Una vez que el servidor esté ejecutándose, puedes acceder a la documentación de Swagger en:

**http://localhost:3000/api**

## 🧪 Testing

### Ejecutar tests unitarios

```bash
npm run test
```

### Ejecutar tests e2e

```bash
npm run test:e2e
```

### Ejecutar tests con coverage

```bash
npm run test:cov
```

## 🔧 Scripts Disponibles

- `npm run start` - Inicia el servidor en modo producción
- `npm run start:dev` - Inicia el servidor en modo desarrollo con hot reload
- `npm run build` - Compila el proyecto TypeScript
- `npm run test` - Ejecuta tests unitarios
- `npm run test:e2e` - Ejecuta tests end-to-end
- `npm run test:cov` - Ejecuta tests con reporte de cobertura
- `npm run lint` - Ejecuta el linter
- `npm run lint:fix` - Ejecuta el linter y corrige errores automáticamente

## 📝 Notas Importantes

- El proyecto incluye Swagger para documentación automática de la API
- Se han configurado validaciones globales con `class-validator`
- CORS está habilitado para desarrollo
- El proyecto sigue las mejores prácticas de NestJS
