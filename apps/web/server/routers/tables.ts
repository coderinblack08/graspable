import { ColumnType, PrismaClient, Table } from "@prisma/client";
import { Subscription, TRPCError } from "@trpc/server";
import { LexoRank } from "lexorank";
import { z } from "zod";
import redis from "../../lib/redis";
import { useMemberCheck } from "../../lib/security-utils";
import { createRouter } from "../createRouter";
import { ee } from "../ee";

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
  .subscription("onAdd", {
    input: z.object({
      workspaceId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<Table>((emit) => {
        const onAdd = (table: Table) => {
          if (table.workspaceId === input.workspaceId) {
            emit.data(table);
          }
        };
        ee.on("table.add", onAdd);
        return () => {
          ee.off("table.add", onAdd);
        };
      });
    },
  })
  .subscription("onUpdate", {
    input: z.object({
      workspaceId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<Table>((emit) => {
        const onUpdate = (table: Table) => {
          if (table.workspaceId === input.workspaceId) {
            emit.data(table);
          }
        };
        ee.on("table.update", onUpdate);
        return () => {
          ee.off("table.update", onUpdate);
        };
      });
    },
  })
  .subscription("onDelete", {
    input: z.object({
      workspaceId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<Table>((emit) => {
        const onUpdate = (table: Table) => {
          if (table.workspaceId === input.workspaceId) {
            emit.data(table);
          }
        };
        ee.on("table.delete", onUpdate);
        return () => {
          ee.off("table.delete", onUpdate);
        };
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
      ee.emit("table.add", table);
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
      const newTable = await ctx.prisma.table.update({
        where: { id: input.tableId },
        data: { name: input.name },
      });
      ee.emit("table.update", newTable);
      return newTable;
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
      const oldTable = await ctx.prisma.table.delete({
        where: { id: input.tableId },
      });
      ee.emit("table.delete", oldTable);
      return oldTable;
    },
  });
