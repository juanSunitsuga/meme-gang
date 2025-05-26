import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey } from 'sequelize-typescript';
import { User } from './User';
import { Post } from './Post';

@Table({
  tableName: 'Votes',
  timestamps: false,
})
export class Votes extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @PrimaryKey
  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare post_id: string;

  @BelongsTo(() => User)
  declare user: User;

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