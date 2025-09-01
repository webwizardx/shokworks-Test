import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserRole } from '../modules/users/entities/user.entity';
import { UsersService } from '../modules/users/users.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Create initial users
    const users = [
      {
        name: 'Admin User',
        email: 'jalvarado@shokworks.com',
        role: UserRole.ADMIN,
      },
      {
        name: 'Regular User',
        email: 'user@shokworks.com',
        role: UserRole.USER,
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
