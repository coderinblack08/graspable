import { createRouter } from "../createRouter";
import { z } from "zod";
import { Row } from "@prisma/client";

export const rowRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.$queryRaw<
        Row[]
      >`select * from public."Row" where "tableId" = ${input.tableId} order by rank collate "C";`;
      // return ctx.prisma.row.findMany({
      //   where: input,
      //   orderBy: { rank: "asc" },
      // });
    },
  })
  .mutation("updateRank", {
    input: z.object({
      id: z.string(),
      rank: z.string(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.row.update({
        where: { id: input.id },
        data: { rank: input.rank },
      });
    },
  })
  .mutation("add", {
    input: z.object({
      tableId: z.string(),
      rank: z.string(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.row.create({ data: input });
    },
  })
  .mutation("delete", {
    input: z.object({
      ids: z.array(z.string()),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.row.deleteMany({ where: { id: { in: input.ids } } });
    },
  });
