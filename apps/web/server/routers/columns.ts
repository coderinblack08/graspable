import { createRouter } from "../createRouter";
import { z } from "zod";
import { Column, ColumnType } from "@prisma/client";
import { LexoRank } from "lexorank";
import { Subscription } from "@trpc/server";
import { ee } from "../ee";

export const columnsRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      // return ctx.prisma.column.findMany({ where: input });
      return ctx.prisma.$queryRaw<
        Column[]
      >`select * from public."Column" where "tableId" = ${input.tableId} order by rank collate "C";`;
    },
  })
  .subscription("onAdd", {
    input: z.object({
      tableId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<Column>((emit) => {
        const onAdd = (data: Column) => {
          if (data.tableId === input.tableId) {
            emit.data(data);
          }
        };
        ee.on("column.add", onAdd);
        return () => {
          ee.off("column.add", onAdd);
        };
      });
    },
  })
  .subscription("onUpdate", {
    input: z.object({
      tableId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<Column>((emit) => {
        const onUpdate = (column: Column) => {
          if (column.tableId === input.tableId) {
            emit.data(column);
          }
        };
        ee.on("column.update", onUpdate);
        return () => {
          ee.off("column.update", onUpdate);
        };
      });
    },
  })
  .subscription("onDelete", {
    input: z.object({
      tableId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<Column>((emit) => {
        const onDelete = (column: Column) => {
          if (column.tableId === input.tableId) {
            emit.data(column);
          }
        };
        ee.on("column.delete", onDelete);
        return () => {
          ee.off("column.delete", onDelete);
        };
      });
    },
  })
  .mutation("add", {
    input: z.object({
      tableId: z.string(),
      name: z.string(),
      type: z.nativeEnum(ColumnType),
      dropdownOptions: z.array(z.string()).optional(),
      rank: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      if (!input.rank) input.rank = LexoRank.middle().toString();
      const column = await ctx.prisma.column.create({
        data: { ...input, rank: input.rank },
      });
      ee.emit("column.add", column);
      return column;
    },
  })
  .mutation("update", {
    input: z.object({
      id: z.string(),
      name: z.string().optional(),
      width: z.number().min(100).max(400).optional(),
      rank: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      const column = await ctx.prisma.column.update({
        where: { id: input.id },
        data: input,
      });
      ee.emit("column.update", column);
      return column;
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const column = await ctx.prisma.column.delete({
        where: { id: input.id },
      });
      ee.emit("column.delete", column);
      return column;
    },
  });
