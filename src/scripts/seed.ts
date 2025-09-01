import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from '../app.module';
import { UserRole } from '../modules/users/entities/user.entity';
import { UsersService } from '../modules/users/users.service';

async function seed() {
  process.env.NODE_ENV = 'development';

  const app = await NestFactory.createApplicationContext(AppModule);
  const sequelize = app.get<Sequelize>(getConnectionToken());
  const usersService = app.get(UsersService);

  try {
    console.log('🔄 Syncing database...');
    await sequelize.sync({ force: true });
    console.log('✅ Database synced successfully');

    const users = [
      {
        name: 'Admin User',
        email: 'jalvarado@shokworks.com',
        role: UserRole.ADMIN,
        password: 'password123',
      },
      {
        name: 'Regular User',
        email: 'user@shokworks.com',
        role: UserRole.USER,
        password: 'password123',
      },
    ];

    for (const userData of users) {
      try {
        await usersService.create(userData);
        console.log(`✅ Created user: ${userData.email}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  User already exists: ${userData.email}`);
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    console.log('🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
  }
}

seed();
