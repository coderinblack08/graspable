import { Filter, FilterOperation } from "@prisma/client";
import { Subscription } from "@trpc/server";
import { z } from "zod";
import { useMemberCheck } from "../../lib/security-utils";
import { createRouter } from "../createRouter";
import { ee } from "../ee";

export const filterRouter = createRouter()
  .query("byViewId", {
    input: z.object({
      viewId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input, true);
      return ctx.prisma.filter.findMany({
        where: input,
      });
    },
  })
  .subscription("onAdd", {
    input: z.object({
      viewId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input, true);
      return new Subscription<Filter>((emit) => {
        const onInsert = (filter: Filter) => {
          if (filter.viewId === input.viewId) {
            emit.data(filter);
          }
        };
        ee.on("filter.add", onInsert);
        return () => {
          ee.off("filter.add", onInsert);
        };
      });
    },
  })
  .subscription("onUpdate", {
    input: z.object({
      viewId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input, true);
      return new Subscription<Filter>((emit) => {
        const onUpdate = (filter: Filter) => {
          if (filter.viewId === input.viewId) {
            emit.data(filter);
          }
        };
        ee.on("filter.update", onUpdate);
        return () => {
          ee.off("filter.update", onUpdate);
        };
      });
    },
  })
  .subscription("onDelete", {
    input: z.object({
      viewId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input, true);
      return new Subscription<Filter>((emit) => {
        const onDelete = (filter: Filter) => {
          if (filter.viewId === input.viewId) {
            emit.data(filter);
          }
        };
        ee.on("filter.delete", onDelete);
        return () => {
          ee.off("filter.delete", onDelete);
        };
      });
    },
  })
  .mutation("add", {
    input: z.object({
      viewId: z.string(),
      columnId: z.string().nullable(),
      operation: z.nativeEnum(FilterOperation).nullable(),
      value: z.string().nullable(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { viewId: input.viewId }, false);
      const filter = await ctx.prisma.filter.create({ data: input });
      ee.emit("filter.add", filter);
      return filter;
    },
  })
  .mutation("update", {
    input: z.object({
      id: z.string(),
      viewId: z.string(),
      columnId: z.string().nullable(),
      operation: z.nativeEnum(FilterOperation).nullable(),
      value: z.string().nullable(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { viewId: input.viewId }, false);
      const filter = await ctx.prisma.filter.update({
        where: { id: input.id },
        data: input,
      });
      ee.emit("filter.update", filter);
      return filter;
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
      viewId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { viewId: input.viewId }, false);
      const filter = await ctx.prisma.filter.delete({
        where: {
          id: input.id,
        },
      });
      ee.emit("filter.delete", filter);
      return filter;
    },
  });
