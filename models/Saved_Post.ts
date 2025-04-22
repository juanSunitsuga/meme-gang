import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'Tags',
  timestamps: false, // No timestamps in the migration file
})
export class Tag extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare tag_name: string;
}