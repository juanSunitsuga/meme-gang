import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Post } from './Post';

@Table({
  tableName: 'UpvoteDownvotes',
  timestamps: true,
})
export class UpvoteDownvote extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare post_id: string;

  @BelongsTo(() => Post)
  declare post: Post;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare is_upvote: boolean;

  @Column({
      type: DataType.DATE,
      allowNull: false,
      defaultValue: DataType.NOW,
    })
    declare edited_at: Date;
}