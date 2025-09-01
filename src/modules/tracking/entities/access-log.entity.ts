import { Column, CreatedAt, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'access_logs',
  timestamps: true,
})
export class AccessLog extends Model {
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
  declare username: string;

  @CreatedAt
  declare timestamp: Date;
}
