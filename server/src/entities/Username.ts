import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Username {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field() // if we comment the field we can't expose to use data in graphql
  @Property({ type: "text", unique: true })
  username!: string;

  @Field()
  @Property({type: "text", unique: true})
  email!: string;

  @Property({ type: "text" })
  password!: string;
}
