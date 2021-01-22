import { Username  } from "../entities/Username";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponce {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Username, { nullable: true })
  user?: Username;
}

@Resolver()
export class UserResolver {
  // @Mutation(() => Boolean)
  // forgotPassword(
  //   @Arg('email') email: string,
  //   @Ctx() {req} : MyContext
  // ){
    
  // }

  @Query(() => Username, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    // you are not login
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(Username, { id: req.session.userId });
    return user;
  }
  @Mutation(() => UserResponce)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponce> {

    const errors = validateRegister(options)
    if(errors){
      return {errors}
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(Username, {
      username: options.username,
      email: options.email,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === "23505" || error.detail.include("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "username exist",
            },
          ],
        };
      }
    }
    // session cookie
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponce)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponce> {
    const user = await em.findOne(Username, 
      usernameOrEmail.includes("@") ? {email: usernameOrEmail}:
      {username: usernameOrEmail}
      );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "username or email don't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrent password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie("qid");
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
