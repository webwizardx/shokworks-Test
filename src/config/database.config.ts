import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { join } from 'path';

export const databaseConfig: SequelizeModuleOptions = {
  dialect: 'sqlite',
  storage: join(process.cwd(), 'database', 'app.sqlite'),
  autoLoadModels: true,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
};
