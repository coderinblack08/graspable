import { createRouter } from "../createRouter";
import { z } from "zod";
import { Column, ColumnType } from "@prisma/client";
import { LexoRank } from "lexorank";
import { Subscription, TRPCError } from "@trpc/server";
import { ee } from "../ee";
import { useMemberCheck } from "../../lib/security-utils";

export const columnsRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input, true);
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
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input, true);
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
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input, true);
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
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input, true);
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
      await useMemberCheck(ctx, { tableId: input.tableId }, false);
      if (!input.rank) input.rank = LexoRank.middle().toString();
      const column = await ctx.prisma.column.create({
        data: { ...input, rank: input.rank },
      });
      const form = await ctx.prisma.form.findFirst({
        where: { tableId: column.tableId },
      });
      if (form) {
        await ctx.prisma.formField.create({
          data: {
            columnId: column.id,
            label: column.name,
            formId: form.id,
          },
        });
      }
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
      const column = await ctx.prisma.column.findFirst({
        where: { id: input.id },
      });
      if (!column) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await useMemberCheck(ctx, { tableId: column.tableId }, false);
      const newColumn = await ctx.prisma.column.update({
        where: { id: input.id },
        data: input,
      });
      ee.emit("column.update", newColumn);
      return newColumn;
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const column = await ctx.prisma.column.findFirst({
        where: { id: input.id },
      });
      if (!column) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await useMemberCheck(ctx, { tableId: column.tableId }, false);
      const oldColumn = await ctx.prisma.column.delete({
        where: { id: input.id },
      });
      try {
        await ctx.prisma
          .$executeRaw`delete from "FormField" where "columnId" = ${input.id};`;
      } catch (error) {}
      ee.emit("column.delete", oldColumn);
      return oldColumn;
    },
  });
