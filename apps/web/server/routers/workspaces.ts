import { MemberRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { useMemberCheck } from "../../lib/security-utils";
import { createRouter } from "../createRouter";
import { createNewTable } from "./tables";

export const workspaceRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .mutation("join", {
    input: z.object({
      workspaceId: z.string(),
    }),
    async resolve({ ctx, input }) {},
  })
  .mutation("disconnect", {
    input: z.object({
      workspaceId: z.string(),
    }),
    async resolve({ ctx, input }) {},
  })
  .query("all", {
    async resolve({ ctx }) {
      const members = await ctx.prisma.member.findMany({
        where: {
          userId: ctx.session!.user.id,
        },
      });
      return (
        await ctx.prisma.workspace.findMany({
          where: {
            id: { in: members.map((m) => m.workspaceId) },
          },
          include: {
            Table: true,
            User: true,
          },
        })
      ).filter((w) => !w.deleted);
    },
  })
  .query("byId", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input.id, true);
      return ctx.prisma.workspace.findFirst({
        where: input,
      });
    },
  })
  .mutation("add", {
    input: z.object({ name: z.string() }),
    async resolve({ ctx, input }) {
      const workspace = await ctx.prisma.workspace.create({
        data: {
          ...input,
          ownerId: ctx.session!.user.id,
        },
      });
      await ctx.prisma.member.create({
        data: {
          role: MemberRole.owner,
          userId: ctx.session!.user.id,
          workspaceId: workspace.id,
        },
      });
      const { columns, rows } = await createNewTable(ctx.prisma, workspace.id);
      return { ...workspace, columns, rows };
    },
  })
  .mutation("update", {
    input: z.object({ id: z.string(), name: z.string() }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input.id, true);
      return ctx.prisma.workspace.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    },
  })
  .mutation("delete", {
    input: z.object({ id: z.string() }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, input.id, false);
      return ctx.prisma.workspace.update({
        where: { id: input.id },
        data: { deleted: true },
      });
    },
  });
