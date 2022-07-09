import { ViewType } from "@prisma/client";
import { z } from "zod";
import { useMemberCheck } from "../../lib/security-utils";
import { createRouter } from "../createRouter";

export const viewRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, true);
      return ctx.prisma.view.findMany({ where: { tableId: input.tableId } });
    },
  })
  .mutation("add", {
    input: z.object({
      tableId: z.string(),
      kanbanOnColumnId: z.string().optional(),
      type: z.nativeEnum(ViewType),
      name: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, false);
      return ctx.prisma.view.create({ data: input });
    },
  });
