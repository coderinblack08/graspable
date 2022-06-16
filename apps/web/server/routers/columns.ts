import { createRouter } from "../createRouter";
import { z } from "zod";
import { Column, ColumnType } from "@prisma/client";
import { LexoRank } from "lexorank";

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
  .mutation("add", {
    input: z.object({
      tableId: z.string(),
      name: z.string(),
      type: z.nativeEnum(ColumnType),
      dropdownOptions: z.array(z.string()).optional(),
      rank: z.string().default(LexoRank.middle().toString()),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.column.create({ data: input });
    },
  });
