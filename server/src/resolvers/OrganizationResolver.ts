import { Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Organization } from "../../prisma/generated/type-graphql";
import { isAuth } from "../middlewares/isAuth";
import { prisma } from "../prisma";
import { MyContext } from "../types";

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
  async createOrganization() {}
}
