import { nanoid } from "nanoid";
import { Subscription, TRPCError } from "@trpc/server";
import { z } from "zod";
import redis from "../../lib/redis";
import { createRouter } from "../createRouter";
import { ee } from "../ee";
import { User } from "@prisma/client";
import { useMemberCheck } from "../../lib/security-utils";

const zodCursor = z.object({
  rowId: z.string(),
  columnId: z.string(),
  tableId: z.string(),
  id: z.string().nullish(),
});

export type Cursor = z.infer<typeof zodCursor> & {
  userId: string;
  user?: User | null;
};

export const cursorRouter = createRouter()
  .mutation("upsert", {
    meta: { hasAuth: true },
    input: zodCursor,
    async resolve({ input, ctx }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, true);
      if (!input.id) input.id = nanoid(12);
      const data = { ...input, userId: ctx.session!.user.id };
      await redis.set(
        `cursor:${input.tableId}:${input.id}`,
        JSON.stringify(data)
      );
      ee.emit("cursor.update", {
        ...data,
        user: await ctx.prisma.user.findFirst({ where: { id: data.userId } }),
      });
      return input;
    },
  })
  .subscription("onDelete", {
    meta: { hasAuth: true },
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, true);
      return new Subscription<any>((emit) => {
        const onDelete = (cursor: any) => {
          if (cursor.tableId === input.tableId) {
            emit.data(cursor.cursorId);
          }
        };
        ee.on("cursor.delete", onDelete);
        return () => {
          ee.off("cursor.delete", onDelete);
        };
      });
    },
  })
  .subscription("onUpdate", {
    meta: { hasAuth: true },
    input: z.object({
      tableId: z.string(),
      cursorId: z.string().nullish(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, true);
      return new Subscription<Cursor>((emit) => {
        const onUpdate = (cursor: Cursor) => {
          if (cursor.tableId === input.tableId) {
            emit.data(cursor);
          }
        };
        ee.on("cursor.update", onUpdate);
        return () => {
          if (input.cursorId) {
            redis.del(`cursor:${input.tableId}:${input.cursorId}`);
            ee.emit("cursor.delete", input as any);
          }
          ee.off("cursor.update", onUpdate);
        };
      });
    },
  })
  .query("byTableId", {
    meta: { hasAuth: true },
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      // let keys: any[] = [];
      // const stream = redis.scanStream({ match: `cursor:${input.tableId}:*` });
      // stream.on("data", (more) => (keys = keys.concat(more)));
      // stream.on("error", (error) => {
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: error.message,
      //   });
      // });
      await useMemberCheck(ctx, { tableId: input.tableId }, true);
      const keys = await redis.keys(`cursor:${input.tableId}:*`);
      if (keys.length) {
        const values = await redis.mget(...keys);
        return Promise.all(
          values.map(async (value) => {
            const cursor: Cursor = JSON.parse(value!);
            cursor.user = await ctx.prisma.user.findFirst({
              where: { id: cursor.userId },
            });
            return cursor;
          })
        );
      }
      return [];
    },
  });
