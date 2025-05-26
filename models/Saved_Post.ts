import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User'; // Adjust the path as needed
import { Post } from './Post'; // Adjust the path as needed

@Table({
  tableName: 'Saved_Posts',
  timestamps: false,
})
export class SavedPost extends Model {
  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  declare post_id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  declare user_id: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare saved_at: Date;

  // Associations
  @BelongsTo(() => Post, {
    foreignKey: 'post_id',
    as: 'post'
  })
  declare post: Post;

  @BelongsTo(() => User, {
    foreignKey: 'user_id',
    as: 'user'
  })
  declare user: User;
}