# Backend Technical Assessment

A NestJS application with SQLite database using Sequelize ORM, containerized with Docker.

## Features

- **NestJS Framework**: Modern Node.js framework with TypeScript
- **SQLite Database**: Lightweight, file-based database
- **Sequelize ORM**: Type-safe database operations
- **Docker Support**: Easy containerization and deployment
- **Swagger Documentation**: API documentation at `/api`
- **User Management**: CRUD operations for users

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (optional)

## Quick Start with Docker

```bash
# Build and start the application
docker-compose up --build

# The API will be available at http://localhost:3000
# Swagger documentation at http://localhost:3000/api
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Seed the database with initial data
npm run seed

# Reset database (delete and recreate)
npm run db:reset
```

## Database

The application uses SQLite with Sequelize ORM:

- **Location**: `database/app.sqlite`
- **Auto-sync**: Enabled in development
- **Migrations**: Not configured (using `synchronize: true`)

### Models

- **User**: `id`, `name`, `email`, `password`, `isActive`, `createdAt`, `updatedAt`

## API Endpoints

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Environment Variables

Create a `.env` file:

```env
NODE_ENV=development
PORT=3000
```

## Docker Commands

```bash
# Build image
docker build -t backend-assessment .

# Run container
docker run -p 3000:3000 -v $(pwd)/database:/app/database backend-assessment

# Development with volumes
docker-compose up --build
```

## Scripts

- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run seed` - Seed database with initial data
- `npm run db:reset` - Reset database
- `npm run test` - Run tests
- `npm run lint` - Lint code

## Project Structure

```
src/
├── config/
│   ├── database.config.ts    # Sequelize configuration
│   └── global.ts
├── modules/
│   └── users/
│       ├── entities/
│       │   └── user.entity.ts
│       ├── dto/
│       │   ├── create-user.dto.ts
│       │   └── update-user.dto.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── users.module.ts
├── scripts/
│   └── seed.ts              # Database seeding
└── app.module.ts
```

## Development Notes

- Database file is created automatically on first run
- Hot reload enabled in development mode
- SQLite database is persisted in Docker volumes
- Sequelize logging enabled in development
