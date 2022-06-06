import { MemberRole, Prisma } from "@prisma/client";
import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { UserObject } from "../objects/UserObject";
import { MyContext } from "../types";
import { User } from "../../prisma/generated/type-graphql";

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
  // @ts-ignore
  async register(
    @Arg("options") options: EmailPasswordInput,
    @Ctx() { req, prisma }: MyContext
  ) {
    const hashedPassword = await argon2.hash(options.password);
    try {
      const user = await prisma.user.create({
        data: {
          name: options.name,
          email: options.email,
          password: hashedPassword,
          organizations: { create: [{ name: "My Organization" }] },
        },
        include: {
          organizations: true,
        },
      });
      await prisma.member.create({
        data: {
          userId: user.id,
          role: MemberRole.owner,
          organizationId: user.organizations[0].id,
        },
      });
      req.session.userId = user.id;
      return { user };
    } catch (error) {
      // duplicate email error
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
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
  }

  @Mutation(() => UserObject)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { req, prisma }: MyContext
  ): Promise<UserObject> {
    const user = await prisma.user.findFirst({ where: { email } });
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
  me(@Ctx() { req, prisma }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return prisma.user.findFirst({ where: { id: req.session.userId } });
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
