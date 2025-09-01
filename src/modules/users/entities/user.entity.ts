import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from 'sequelize-typescript';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Table({
  tableName: 'users',
  timestamps: true,
  scopes: {
    withoutPassword: {
      attributes: {
        exclude: ['password'],
      },
    },
  },
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
