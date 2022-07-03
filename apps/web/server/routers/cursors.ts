import { Cursor, User } from "@prisma/client";
import { Subscription } from "@trpc/server";
import { z } from "zod";
import { useMemberCheck } from "../../lib/security-utils";
import { createRouter } from "../createRouter";
import { ee } from "../ee";

const zodCursor = z.object({
  id: z.string(),
  rowId: z.string().nullish(),
  columnId: z.string().nullish(),
  tableId: z.string(),
});

export const cursorRouter = createRouter()
  .mutation("update", {
    meta: { hasAuth: true },
    input: zodCursor,
    async resolve({ input, ctx }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, true);
      const data = {
        rowId: input.rowId,
        columnId: input.columnId,
        tableId: input.tableId,
        userId: ctx.session!.user.id,
      };
      const cursor = await ctx.prisma.cursor.update({
        where: { id: input.id },
        data,
        include: { user: true },
      });
      ee.emit("cursor.update", cursor);
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
      return new Subscription<Cursor & { user?: User }>((emit) => {
        const onDelete = (cursor: Cursor & { user?: User }) => {
          if (cursor.tableId === input.tableId) {
            emit.data(cursor);
          }
        };
        ee.on("cursor.delete", onDelete);
        return () => {
          ee.off("cursor.delete", onDelete);
        };
      });
    },
  })
  .subscription("onCreate", {
    meta: { hasAuth: true },
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, true);
      return new Subscription<Cursor & { user: User }>((emit) => {
        const onCreate = (cursor: Cursor & { user: User }) => {
          if (cursor.tableId === input.tableId) {
            emit.data(cursor);
          }
        };
        ee.on("cursor.create", onCreate);
        return () => {
          ee.off("cursor.create", onCreate);
        };
      });
    },
  })
  .subscription("onUpdate", {
    meta: { hasAuth: true },
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, true);
      return new Subscription<Cursor & { user: User }>((emit) => {
        let cursorId: string;
        ctx.prisma.cursor
          .create({
            data: {
              tableId: input.tableId,
              userId: ctx.session!.user.id,
            },
            include: { user: true },
          })
          .then((cursor) => {
            ee.emit("cursor.create", cursor);
            cursorId = cursor.id;
          });
        const onUpdate = (cursor: Cursor & { user: User }) => {
          if (cursor.tableId === input.tableId) {
            emit.data(cursor);
          }
        };
        ee.on("cursor.update", onUpdate);
        return () => {
          ctx.prisma.cursor
            .delete({
              where: { id: cursorId },
            })
            .then((cursor) => {
              ee.emit("cursor.delete", cursor);
              ee.off("cursor.update", onUpdate);
            });
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
      await useMemberCheck(ctx, { tableId: input.tableId }, true);
      return ctx.prisma.cursor.findMany({
        where: { tableId: input.tableId },
        include: { user: true },
      });
    },
  });
