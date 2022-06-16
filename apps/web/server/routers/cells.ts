import { createRouter } from "../createRouter";
import { z } from "zod";

export const cellRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.cell.findMany({ where: input });
    },
  })
  .mutation("upsert", {
    input: z.object({
      tableId: z.string(),
      rowId: z.string(),
      columnId: z.string(),
      value: z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.string()),
      ]),
    }),
    async resolve({ ctx, input }) {
      if (input.value instanceof Array) {
        input.value = JSON.stringify(input.value);
      }
      if (typeof input.value === "boolean" || typeof input.value === "number") {
        input.value = input.value.toString();
      }
      const update: Record<string, any> = { value: input.value };
      return ctx.prisma.cell.upsert({
        where: {
          rowId_columnId: {
            rowId: input.rowId,
            columnId: input.columnId,
          },
        },
        create: { ...input, value: input.value },
        update,
      });
    },
  });
