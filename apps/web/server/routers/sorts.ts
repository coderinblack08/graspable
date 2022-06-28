import { createRouter } from "../createRouter";
import { z } from "zod";
import { Sort, SortDirection } from "@prisma/client";
import { ee } from "../ee";
import { Subscription } from "@trpc/server";

export const sortRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.sort.findMany({
        where: {
          tableId: input.tableId,
        },
      });
    },
  })
  .subscription("onAdd", {
    input: z.object({
      tableId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<Sort>((emit) => {
        const onInsert = (sort: Sort) => {
          if (sort.tableId === input.tableId) {
            emit.data(sort);
          }
        };
        ee.on("sort.add", onInsert);
        return () => {
          ee.off("sort.add", onInsert);
        };
      });
    },
  })
  .subscription("onUpdate", {
    input: z.object({
      tableId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<Sort>((emit) => {
        const onUpdate = (sort: Sort) => {
          if (sort.tableId === input.tableId) {
            emit.data(sort);
          }
        };
        ee.on("sort.update", onUpdate);
        return () => {
          ee.off("sort.update", onUpdate);
        };
      });
    },
  })
  .subscription("onDelete", {
    input: z.object({
      tableId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<string[]>((emit) => {
        const onDelete = (sort: Sort) => {
          if (sort.tableId === input.tableId) {
            emit.data([sort.id]);
          }
        };
        ee.on("sort.delete", onDelete);
        return () => {
          ee.off("sort.delete", onDelete);
        };
      });
    },
  })
  .mutation("add", {
    input: z.object({
      tableId: z.string(),
      columnId: z.string().nullable(),
      direction: z.nativeEnum(SortDirection).nullable(),
    }),
    async resolve({ ctx, input }) {
      const sort = await ctx.prisma.sort.create({ data: input });
      ee.emit("sort.add", sort);
      return sort;
    },
  })
  .mutation("update", {
    input: z.object({
      id: z.string(),
      tableId: z.string(),
      columnId: z.string().nullable(),
      direction: z.nativeEnum(SortDirection).nullable(),
    }),
    async resolve({ ctx, input }) {
      const sort = await ctx.prisma.sort.update({
        where: { id: input.id },
        data: input,
      });
      ee.emit("sort.update", sort);
      return sort;
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const sort = await ctx.prisma.sort.delete({
        where: {
          id: input.id,
        },
      });
      ee.emit("sort.delete", sort);
      return sort;
    },
  });
