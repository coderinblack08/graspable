import { createRouter } from "../createRouter";
import { z } from "zod";
import { LexoRank } from "lexorank";
import { ColumnType, MemberRole, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const createNewTable = async (
  prisma: PrismaClient,
  workspaceId: string
) => {
  const table = await prisma.table.create({
    data: {
      name: "Untitled Table",
      workspaceId,
    },
  });
  let firstRank = LexoRank.middle();
  const generateNextRank = () => {
    firstRank = firstRank.genNext();
    return firstRank;
  };
  const columns = await prisma.column.createMany({
    data: [
      {
        name: "Task",
        type: ColumnType.text,
        rank: firstRank.toString(),
        tableId: table.id,
      },
      {
        name: "Status",
        type: ColumnType.dropdown,
        rank: generateNextRank().toString(),
        dropdownOptions: ["Todo", "In Progress", "Done"],
        tableId: table.id,
      },
      {
        name: "Due Date",
        rank: generateNextRank().toString(),
        type: ColumnType.date,
        tableId: table.id,
      },
    ],
  });
  firstRank = LexoRank.middle();
  const rows = await prisma.row.createMany({
    data: [
      {
        rank: firstRank.toString(),
        tableId: table.id,
      },
      {
        rank: generateNextRank().toString(),
        tableId: table.id,
      },
      {
        rank: generateNextRank().toString(),
        tableId: table.id,
      },
    ],
  });
  return { columns, rows, table };
};

export const tablesRouter = createRouter()
  .query("byWorkspaceId", {
    input: z.object({
      workspaceId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.table.findMany({ where: input });
    },
  })
  .mutation("add", {
    input: z.object({
      workspaceId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const membership = await ctx.prisma.member.findFirst({
        where: {
          userId: ctx.session!.user.id,
          workspaceId: input.workspaceId,
          role: { in: [MemberRole.owner, MemberRole.editor] },
        },
      });
      if (!membership) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const { columns, rows, table } = await createNewTable(
        ctx.prisma,
        input.workspaceId
      );
      return { ...table, columns, rows };
    },
  });
