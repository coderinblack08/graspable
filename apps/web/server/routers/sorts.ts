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
      columnId: z.string(),
      direction: z.nativeEnum(SortDirection),
    }),
    async resolve({ ctx, input }) {
      const sort = await ctx.prisma.sort.create({ data: input });
      return sort;
    },
  });
