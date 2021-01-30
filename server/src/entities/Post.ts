import { Field, Int, ObjectType } from "type-graphql";
import {BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm'
import { Updoot } from "./Updoot";
import { Username } from "./Username";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field() 
  @Column({ type: "text" })
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({type: "int", default: 0})
  points!: number;

  @Field(()=>Int,{nullable:true})
  voteStatus: number | null;

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @ManyToOne(() => Username, (username) => username.posts)
  creator: Username;

  @OneToMany(() => Updoot, (updoot) => updoot.post)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = new Date();
}
