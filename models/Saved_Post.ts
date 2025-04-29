import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from './User'; // Adjust the path as needed
import { Post } from './Post'; // Adjust the path as needed

@Table({
  tableName: 'Saved_Posts',
  timestamps: false, // No createdAt or updatedAt fields
})
export class SavedPost extends Model {
  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare post_id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare saved_at: Date;
}