# Backend Technical Assessment

A NestJS application with SQLite database using Sequelize ORM, containerized with Docker.

## Features

- **NestJS Framework**: Modern Node.js framework with TypeScript
- **SQLite Database**: Lightweight, file-based database
- **Sequelize ORM**: Type-safe database operations
- **Swagger Documentation**: API documentation at `/api`
- **User Management**: CRUD operations for users

## Prerequisites

- Node.js 20+

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

## Environment Variables

Create a `.env` file:

```env
JWT_SALT=10
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3000
```

## Scripts

- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run seed` - Seed database with initial data
- `npm run db:reset` - Reset database
- `npm run test` - Run tests
- `npm run lint` - Lint code
