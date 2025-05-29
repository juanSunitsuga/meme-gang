import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { User } from './User';
import { Tag } from './Tag';

@Table({
  tableName: 'Posts',
  timestamps: true,
})
export class Post extends Model {
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
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare image_url?: string;

  @BelongsToMany(() => Tag, {
    through: 'PostTags', // This should be your junction table name
    foreignKey: 'post_id',
    otherKey: 'tag_id',
    as: 'tags'
  })
  declare tags?: Tag[];

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