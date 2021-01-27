import { Field, Int, ObjectType } from "type-graphql";
import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm'

@ObjectType()
@Entity()
export class Username extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = new Date();

  @Field() 
  @Column({ type: "text", unique: true })
  username!: string;

  @Field()
  @Column({type: "text", unique: true})
  email!: string;

  @Column({ type: "text" })
  password!: string;
}
