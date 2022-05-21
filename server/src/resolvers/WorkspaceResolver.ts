import { Member } from "../entities/Member";
import { Organization } from "../entities/Organization";
import { MyContext } from "src/types";
import { Ctx, Query, Resolver } from "type-graphql";

@Resolver()
export class WorkspaceResolver {
  @Query(() => [Organization])
  async organizations(@Ctx() { req }: MyContext) {
    // TODO: order by ownership status
    const memberships = await Member.find({
      where: { userId: req.session.userId },
      relations: ["organization"],
    });
    return memberships.map((m) => m.organization);
  }
  // @Mutation(() => Project)
}
