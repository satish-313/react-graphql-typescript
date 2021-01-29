import { Username } from "../entities/Username";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import argon2 from "argon2";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { FORGET_PASSWORD_PREFIX } from "../constants";
import { getConnection } from "typeorm";

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

@Resolver(Username)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: Username, @Ctx() {req}:MyContext){
    if(req.session.userId === user.id){
      return user.email
    }
    return "";
  }

  @Mutation(() => UserResponce)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponce> {
    if (newPassword.length <= 5) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 5",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }
    const userIdNum = parseInt(userId);
    const user = await Username.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exist",
          },
        ],
      };
    }

    await Username.update(
      { id: userIdNum },
      {
        password: await argon2.hash(newPassword),
      }
    );

    await redis.del(key);

    // login user after changing password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await Username.findOne({ where: { email } });
    if (!user) {
      // email not in the database
      return true;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24
    ); // 1day

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return true;
  }

  @Query(() => Username, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // you are not login
    if (!req.session.userId) {
      return null;
    }

    return Username.findOne(req.session.userId);
  }

  @Mutation(() => UserResponce)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponce> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const emailcheck = await Username.findOne({ where: { email: options.email} });
    if (emailcheck) {
      return {
        errors: [
          {
            field: "email",
            message: "email exist",
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Username)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();

      user = result.raw[0];
      // console.log("result:", result);
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
    @Ctx() { req }: MyContext
  ): Promise<UserResponce> {
    const user = await Username.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
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
