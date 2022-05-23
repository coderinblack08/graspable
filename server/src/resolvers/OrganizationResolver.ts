import { MemberRole } from "@prisma/client";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Organization } from "../../prisma/generated/type-graphql";
import { isAuth } from "../middlewares/isAuth";
import { prisma } from "../prisma";
import { MyContext } from "../types";

@InputType()
class CreateOrganizationArgs {
  @Field()
  name: string;
}

@Resolver()
export class OrganizationResolver {
  @Query(() => [Organization])
  @UseMiddleware(isAuth)
  async organizations(@Ctx() { req }: MyContext) {
    const memberships = await prisma.member.findMany({
      where: { userId: req.session.userId },
      include: { organization: true },
    });
    return memberships.map((m) => m.organization);
  }

  @Mutation(() => Organization)
  @UseMiddleware(isAuth)
  async createOrganization(
    @Ctx() { req }: MyContext,
    @Arg("args") args: CreateOrganizationArgs
  ) {
    return prisma.organization.create({
      data: {
        user: { connect: { id: req.session.userId } },
        members: {
          create: [
            {
              userId: req.session.userId,
              role: MemberRole.owner,
            },
          ],
        },
        ...args,
      },
    });
  }
}
