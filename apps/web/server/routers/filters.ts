import { Filter, FilterOperation, Sort } from "@prisma/client";
import { Subscription } from "@trpc/server";
import { z } from "zod";
import { useMemberCheck } from "../../lib/security-utils";
import { createRouter } from "../createRouter";
import { ee } from "../ee";

export const filterRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input, true);
      return ctx.prisma.filter.findMany({
        where: {
          tableId: input.tableId,
        },
      });
    },
  })
  .subscription("onAdd", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input, true);
      return new Subscription<Filter>((emit) => {
        const onInsert = (filter: Filter) => {
          if (filter.tableId === input.tableId) {
            emit.data(filter);
          }
        };
        ee.on("filter.add", onInsert);
        return () => {
          ee.off("filter.add", onInsert);
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
      return new Subscription<Filter>((emit) => {
        const onUpdate = (filter: Filter) => {
          if (filter.tableId === input.tableId) {
            emit.data(filter);
          }
        };
        ee.on("filter.update", onUpdate);
        return () => {
          ee.off("filter.update", onUpdate);
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
      return new Subscription<Filter>((emit) => {
        const onDelete = (filter: Filter) => {
          if (filter.tableId === input.tableId) {
            emit.data(filter);
          }
        };
        ee.on("filter.delete", onDelete);
        return () => {
          ee.off("filter.delete", onDelete);
        };
      });
    },
  })
  .mutation("add", {
    input: z.object({
      tableId: z.string(),
      columnId: z.string().nullable(),
      operation: z.nativeEnum(FilterOperation).nullable(),
      value: z.string().nullable(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, false);
      const filter = await ctx.prisma.filter.create({ data: input });
      ee.emit("filter.add", filter);
      return filter;
    },
  })
  .mutation("update", {
    input: z.object({
      id: z.string(),
      tableId: z.string(),
      columnId: z.string().nullable(),
      operation: z.nativeEnum(FilterOperation).nullable(),
      value: z.string().nullable(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, false);
      const filter = await ctx.prisma.filter.update({
        where: { id: input.id },
        data: input,
      });
      ee.emit("filter.update", filter);
      return filter;
      // const filter = await ctx.prisma
      //   .$executeRaw<Filter>`update "Filter" set "columnId" = ${input.columnId}, "operation" = ${input.operation}, "value" = ${input.value} where id = ${input.id} and "tableId" = ${input.tableId} returning *`;
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, false);
      const filter = await ctx.prisma.filter.delete({
        where: {
          id: input.id,
        },
      });
      ee.emit("filter.delete", filter);
      return filter;
    },
  });
