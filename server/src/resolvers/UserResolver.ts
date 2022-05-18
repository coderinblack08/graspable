import argon2 from "argon2";
import { User } from "../entities/User";
import { UserObject } from "../objects/UserObject";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";

@InputType()
class EmailPasswordInput {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserObject)
  async register(
    @Arg("options") options: EmailPasswordInput,
    @Ctx() { req }: MyContext
  ) {
    const hashedPassword = await argon2.hash(options.password);
    try {
      const user = await User.create({
        name: options.name,
        email: options.email,
        password: hashedPassword,
      }).save();
      req.session.userId = user.id;
      return { user };
    } catch (error) {
      // duplicate email error
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "email",
              message: "email already in use",
            },
          ],
        };
      }
    }
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOneBy({ id: req.session.userId });
  }
}
