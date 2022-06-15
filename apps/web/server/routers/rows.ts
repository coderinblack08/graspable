import { createRouter } from "../createRouter";
import { z } from "zod";

export const rowRouter = createRouter().query("byTableId", {
  input: z.object({
    tableId: z.string(),
  }),
  async resolve({ ctx, input }) {
    return ctx.prisma.row.findMany({ where: input });
  },
});
