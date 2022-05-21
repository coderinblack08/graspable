import argon2 from "argon2";
import { Member, MemberRole } from "../entities/Member";
import { Organization } from "../entities/Organization";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import { UserObject } from "../objects/UserObject";
import { MyContext } from "../types";

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
      const user = new User();
      user.name = options.name;
      user.email = options.email;
      user.password = hashedPassword;
      await user.save();

      const organization = await Organization.create({
        name: "My Organization",
        ownerId: user.id,
      }).save();

      await Member.create({
        userId: user.id,
        role: MemberRole.OWNER,
        organizationId: organization.id,
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

  @Mutation(() => UserObject)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserObject> {
    const user = await User.findOneBy({ email });
    if (!user) {
      return {
        errors: [
          {
            field: "email",
            message: "that email doesn't exist",
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
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOneBy({ id: req.session.userId });
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err: any) => {
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
