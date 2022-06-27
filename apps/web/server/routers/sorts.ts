import { createRouter } from "../createRouter";
import { z } from "zod";
import { SortDirection } from "@prisma/client";

export const sortRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.sort.findMany({
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
      direction: z.nativeEnum(SortDirection).nullable(),
    }),
    async resolve({ ctx, input }) {
      const sort = await ctx.prisma.sort.create({ data: input });
      return sort;
    },
  })
  .mutation("update", {
    input: z.object({
      id: z.string(),
      tableId: z.string(),
      columnId: z.string().nullable(),
      direction: z.nativeEnum(SortDirection).nullable(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.sort.update({
        where: { id: input.id },
        data: input,
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.sort.delete({
        where: {
          id: input.id,
        },
      });
    },
  });
