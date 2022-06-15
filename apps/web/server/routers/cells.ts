import { createRouter } from "../createRouter";
import { z } from "zod";

export const cellRouter = createRouter().query("byTableId", {
  input: z.object({
    tableId: z.string(),
  }),
  async resolve({ ctx, input }) {
    return ctx.prisma.cell.findMany({ where: input });
  },
});
