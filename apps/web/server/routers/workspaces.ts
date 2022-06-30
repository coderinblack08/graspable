import { MemberRole, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { useMemberCheck, useOwnerCheck } from "../../lib/security-utils";
import { createRouter } from "../createRouter";
import { createNewTable } from "./tables";

export const workspaceRouter = createRouter()
  .mutation("joinOrDisconnect", {
    meta: { hasAuth: true },
    input: z.object({
      workspaceId: z.string(),
      active: z.boolean(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.member.update({
        where: {
          userId_workspaceId: {
            userId: ctx.session!.user.id,
            workspaceId: input.workspaceId,
          },
        },
        data: {
          active: input.active,
        },
      });
    },
  })
  .query("myMembership", {
    meta: { hasAuth: true },
    input: z.object({
      workspaceId: z.string(),
    }),
    async resolve({ input, ctx }) {
      return ctx.prisma.member.findFirst({
        where: {
          userId: ctx.session!.user.id,
          ...input,
        },
      });
    },
  })
  .query("getMembers", {
    meta: { hasAuth: true },
    input: z.object({
      workspaceId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const members = await ctx.prisma.member.findMany({
        where: { workspaceId: input.workspaceId },
        include: { User: true },
      });
      return members;
    },
  })
  .mutation("addMember", {
    meta: { hasAuth: true },
    input: z.object({
      workspaceId: z.string(),
      role: z.enum([MemberRole.viewer, MemberRole.editor]),
      email: z.string().email(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { workspaceId: input.workspaceId }, false);
      const user = await ctx.prisma.user.findFirst({
        where: { email: input.email },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      try {
        const member = await ctx.prisma.member.create({
          data: {
            workspaceId: input.workspaceId,
            userId: user.id,
            role: input.role as MemberRole,
          },
        });
        return member;
      } catch (error) {
        // if duplicate
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new TRPCError({ code: "CONFLICT" });
        }
      }
    },
  })
  .mutation("updateMemberRole", {
    meta: { hasAuth: true },
    input: z.object({
      workspaceId: z.string(),
      userId: z.string(),
      role: z.enum([MemberRole.viewer, MemberRole.editor]),
    }),
    async resolve({ ctx, input }) {
      await useOwnerCheck(ctx, input.workspaceId);
      const member = await ctx.prisma.member.update({
        where: {
          userId_workspaceId: {
            workspaceId: input.workspaceId,
            userId: input.userId,
          },
        },
        data: {
          role: input.role as MemberRole,
        },
        include: { User: true },
      });
      return member;
    },
  })
  .mutation("deleteMember", {
    meta: { hasAuth: true },
    input: z.object({
      workspaceId: z.string(),
      userId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useOwnerCheck(ctx, input.workspaceId);
      const member = await ctx.prisma.member.delete({
        where: {
          userId_workspaceId: {
            workspaceId: input.workspaceId,
            userId: input.userId,
          },
        },
      });
      return member;
    },
  })
  .query("all", {
    meta: { hasAuth: true },
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
    meta: { hasAuth: true },
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { workspaceId: input.id }, true);
      return ctx.prisma.workspace.findFirst({
        where: input,
      });
    },
  })
  .mutation("add", {
    meta: { hasAuth: true },
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
    meta: { hasAuth: true },
    input: z.object({ id: z.string(), name: z.string() }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { workspaceId: input.id }, false);
      return ctx.prisma.workspace.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    },
  })
  .mutation("delete", {
    meta: { hasAuth: true },
    input: z.object({ id: z.string() }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { workspaceId: input.id }, false);
      return ctx.prisma.workspace.update({
        where: { id: input.id },
        data: { deleted: true },
      });
    },
  });
