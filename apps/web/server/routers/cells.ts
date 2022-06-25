import { createRouter } from "../createRouter";
import { z } from "zod";
import { ee } from "../ee";
import { Cell } from "@prisma/client";
import { Subscription } from "@trpc/server";

export const cellRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.cell.findMany({ where: input });
    },
  })
  .subscription("onUpsert", {
    input: z.object({
      tableId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<Cell>((emit) => {
        const onUpsert = (data: Cell) => {
          console.log(data);

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
      if (input.value instanceof Array) {
        input.value = JSON.stringify(input.value);
      }
      if (typeof input.value === "boolean" || typeof input.value === "number") {
        input.value = input.value.toString();
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
