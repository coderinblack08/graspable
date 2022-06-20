import { Row } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "../createRouter";

export const rowRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
      sorts: z.array(
        z.object({ columnId: z.string(), direction: z.enum(["asc", "desc"]) })
      ),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.$queryRawUnsafe<Row[]>(
        `
        select r.* 
        from public."Row" r 
        where r."tableId" = $1
        order by ${
          input.sorts.length
            ? input.sorts
                .map(
                  ({ direction }, index) =>
                    `(select c.value from public."Cell" c where c."rowId" = r."id" and c."columnId" = $${
                      2 + index
                    }) ${direction}`
                )
                .join(", ")
            : `r.rank collate "C"`
        }`,
        ...[input.tableId, ...input.sorts.map(({ columnId }) => columnId)]
      );
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
