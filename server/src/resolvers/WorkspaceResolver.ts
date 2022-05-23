import { MemberRole } from "@prisma/client";
import { ApolloError } from "apollo-server-express";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Workspace } from "../../prisma/generated/type-graphql";
import { isAuth } from "../middlewares/isAuth";
import { prisma } from "../prisma";
import { MyContext } from "../types";

@InputType()
class CreateWorkspaceArgs {
  @Field()
  name: string;

  @Field()
  organizationId: number;
}

@Resolver()
export class WorkspaceResolver {
  @Mutation(() => Workspace, { nullable: true })
  @UseMiddleware(isAuth)
  async createWorkspace(
    @Arg("args") args: CreateWorkspaceArgs,
    @Ctx() { req }: MyContext
  ) {
    const membership = await prisma.member.findFirst({
      where: {
        userId: req.session.userId,
        organizationId: args.organizationId,
      },
    });
    if (
      membership !== null &&
      (membership.role === MemberRole.admin ||
        membership.role === MemberRole.owner)
    ) {
      const workspace = await prisma.workspace.create({
        data: {
          name: args.name,
          organization: {
            connect: { id: args.organizationId },
          },
        },
      });
      return workspace;
    } else {
      throw new ApolloError(
        "You are not authorized to create a workspace in this organization"
      );
    }
  }
}
