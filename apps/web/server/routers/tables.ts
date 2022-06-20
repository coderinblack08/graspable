import { createRouter } from "../createRouter";
import { z } from "zod";
import { LexoRank } from "lexorank";
import { ColumnType, MemberRole, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { useMemberCheck } from "../../lib/security-utils";

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
      await useMemberCheck(ctx, input.workspaceId);
      return ctx.prisma.table.findMany({
        where: input,
        orderBy: { createdAt: "asc" },
      });
    },
  })
  .mutation("add", {
    input: z.object({
      workspaceId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input.workspaceId, false);
      const { columns, rows, table } = await createNewTable(
        ctx.prisma,
        input.workspaceId
      );
      return { ...table, columns, rows };
    },
  })
  .mutation("update", {
    input: z.object({
      tableId: z.string(),
      name: z.string(),
    }),
    async resolve({ ctx, input }) {
      const table = await ctx.prisma.table.findFirst({
        where: { id: input.tableId },
      });
      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await useMemberCheck(ctx, table.workspaceId, false);
      return ctx.prisma.table.update({
        where: { id: input.tableId },
        data: { name: input.name },
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const table = await ctx.prisma.table.findFirst({
        where: { id: input.tableId },
      });
      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await useMemberCheck(ctx, table.workspaceId, false);
      return ctx.prisma.table.delete({ where: { id: input.tableId } });
    },
  });
