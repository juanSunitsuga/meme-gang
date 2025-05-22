import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './User';
import { Post } from './Post';

@Table({
  tableName: 'Comments',
  timestamps: true,
})
export class Comment extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string; // Foreign key to User

  @BelongsTo(() => User)
  declare user: User; // setiap komen punya satu user
  // setiap user bisa punya banyak komen

  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare post_id: string; // Foreign key to Post
  // setiap komen punya satu post
  // setiap post bisa punya banyak komen

  @BelongsTo(() => Post)
  declare post: Post;

  @ForeignKey(() => Comment)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare reply_to?: string;

  @BelongsTo(() => Comment, { foreignKey: 'reply_to' })
  declare parentComment?: Comment;

  @HasMany(() => Comment, { foreignKey: 'reply_to' })
  declare replies?: Comment[];

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare content: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt?: Date;
}