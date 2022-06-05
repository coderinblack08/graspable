import { ColumnType, MemberRole } from "@prisma/client";
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
import { Table, Workspace } from "../../prisma/generated/type-graphql";
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
  static async isMember(
    userId: number,
    {
      organizationId,
      workspaceId,
    }: { organizationId?: number; workspaceId?: number }
  ) {
    if (workspaceId) {
      const workspace = await prisma.workspace.findFirst({
        where: { id: workspaceId },
      });
      if (workspace) {
        organizationId = workspace.organizationId!;
      }
    }
    const membership = await prisma.member.findFirst({
      where: { userId, organizationId },
    });
    return (
      membership !== null &&
      (membership.role === MemberRole.editor ||
        membership.role === MemberRole.owner)
    );
  }

  @Mutation(() => Workspace, { nullable: true })
  @UseMiddleware(isAuth)
  async createWorkspace(
    @Arg("args") args: CreateWorkspaceArgs,
    @Ctx() ctx: MyContext
  ) {
    if (
      !(await WorkspaceResolver.isMember(ctx.req.session.userId, {
        organizationId: args.organizationId,
      }))
    ) {
      throw new ApolloError(
        "You are not authorized to create a workspace in this organization"
      );
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: args.name,
        organization: {
          connect: { id: args.organizationId },
        },
      },
    });

    await this.createTable("Table 1", workspace.id, ctx);

    return workspace;
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Table)
  async createTable(
    @Arg("name") name: string,
    @Arg("workspaceId") workspaceId: number,
    @Ctx() { req }: MyContext
  ) {
    if (
      !(await WorkspaceResolver.isMember(req.session.userId, {
        workspaceId,
      }))
    ) {
      throw new ApolloError(
        "You are not authorized to create a workspace in this organization"
      );
    }

    const table = await prisma.table.create({
      data: {
        name,
        workspaceId,
        Column: {
          createMany: {
            data: [
              { name: "Name", type: ColumnType.text },
              { name: "Status", type: ColumnType.checkbox },
              { name: "Date", type: ColumnType.datetime },
            ],
          },
        },
      },
      include: {
        Column: true,
      },
    });

    const row = await prisma.row.create({
      data: {
        tableId: table.id,
        previousId: null,
      },
    });

    await prisma.cell.createMany({
      data: [
        {
          rowId: row.id,
          columnId: table.Column[0].id,
          value: "Create Workspace",
        },
        {
          rowId: row.id,
          columnId: table.Column[1].id,
          value: "true",
        },
        {
          rowId: row.id,
          columnId: table.Column[1].id,
          value: Date.now().toString(),
        },
      ],
    });

    return table;
  }
}
