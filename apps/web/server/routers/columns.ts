import { createRouter } from "../createRouter";
import { z } from "zod";

export const columnsRouter = createRouter().query("byTableId", {
  input: z.object({
    tableId: z.string(),
  }),
  async resolve({ ctx, input }) {
    return ctx.prisma.column.findMany({ where: input });
  },
});
