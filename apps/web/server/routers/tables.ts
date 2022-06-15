import { createRouter } from "../createRouter";
import { z } from "zod";

export const tablesRouter = createRouter().query("byWorkspaceId", {
  input: z.object({
    workspaceId: z.string(),
  }),
  async resolve({ ctx, input }) {
    return ctx.prisma.table.findMany({ where: input });
  },
});
