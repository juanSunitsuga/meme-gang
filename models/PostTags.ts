import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Post } from './Post';
import { Tag } from './Tag';

@Table({
  tableName: 'PostTags',
  timestamps: true,
})
export class PostTag extends Model {
  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  declare post_id: string;

  @ForeignKey(() => Tag)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  declare tag_id: string;

  @BelongsTo(() => Post)
  declare post: Post;

  @BelongsTo(() => Tag)
  declare tag: Tag;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare updatedAt?: Date;
}

export default PostTag;