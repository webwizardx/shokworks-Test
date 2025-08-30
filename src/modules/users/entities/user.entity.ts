export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
