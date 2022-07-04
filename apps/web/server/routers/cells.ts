import { createRouter } from "../createRouter";
import { z } from "zod";
import { ee } from "../ee";
import sanitizeHtml from "sanitize-html";
import { Cell } from "@prisma/client";
import { Subscription } from "@trpc/server";
import { useMemberCheck } from "../../lib/security-utils";

export const cellRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input, true);
      return ctx.prisma.cell.findMany({ where: input });
    },
  })
  .subscription("onUpsert", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input, true);
      return new Subscription<Cell>((emit) => {
        const onUpsert = (data: Cell) => {
          if (data.tableId === input.tableId) {
            emit.data(data);
          }
        };
        ee.on("cell.upsert", onUpsert);
        return () => {
          ee.off("cell.upsert", onUpsert);
        };
      });
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
        z.null(),
      ]),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input, false);
      const column = await ctx.prisma.column.findFirst({
        where: { id: input.columnId },
      });
      if (input.value instanceof Array) {
        input.value = JSON.stringify(input.value);
      }
      if (typeof input.value === "boolean" || typeof input.value === "number") {
        input.value = input.value.toString();
      }
      if (column?.type === "richtext") {
        input.value = sanitizeHtml(input.value || "");
      }
      const update: Record<string, any> = { value: input.value };
      const cell = await ctx.prisma.cell.upsert({
        where: {
          rowId_columnId: {
            rowId: input.rowId,
            columnId: input.columnId,
          },
        },
        create: { ...input, value: input.value },
        update,
      });
      ee.emit("cell.upsert", cell);
      return cell;
    },
  });
