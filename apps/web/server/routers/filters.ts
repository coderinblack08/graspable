import { Filter, FilterOperation } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "../createRouter";

export const filterRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.filter.findMany({
        where: {
          tableId: input.tableId,
        },
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
      const filter = await ctx.prisma.filter.create({ data: input });
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
      return ctx.prisma.filter.update({
        where: { id: input.id },
        data: input,
      });
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
      const filter = await ctx.prisma.filter.delete({
        where: {
          id: input.id,
        },
      });
      return filter;
    },
  });
