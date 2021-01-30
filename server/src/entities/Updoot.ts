import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Post } from "./Post";
import { Username } from "./Username";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @Column({type: "int"})
  value: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => Username)
  @ManyToOne(() => Username, (username) => username.updoots)
  user: Username;

  @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.updoots,{
    onDelete: "CASCADE",
  })
  post: Post;
}
