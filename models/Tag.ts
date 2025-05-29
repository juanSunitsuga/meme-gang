import { Table, Column, Model, DataType, BelongsToMany } from 'sequelize-typescript';
import { Post } from './Post';

@Table({
  tableName: 'Tags',
  timestamps: false,
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

  @BelongsToMany(() => Post, {
    through: 'PostTags',
    foreignKey: 'tag_id',
    otherKey: 'post_id',
    as: 'posts'
  })
  declare posts?: Post[];
}