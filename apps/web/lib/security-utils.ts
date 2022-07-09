import { MemberRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Context } from "../server/context";

export const useMemberCheck = async (
  ctx: Context,
  {
    workspaceId,
    tableId,
    viewId,
  }: { workspaceId?: string; tableId?: string; viewId?: string },
  viewersIncluded = true
) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (viewId) {
    const view = await ctx.prisma.view.findFirst({
      where: { id: viewId },
    });
    if (!view) {
      throw new TRPCError({ code: "NOT_FOUND", message: "View doesn't exist" });
    }
    tableId = view.tableId;
  }
  if (tableId) {
    const table = await ctx.prisma.table.findFirst({
      where: { id: tableId },
    });
    if (!table) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Table doesn't exist",
      });
    }
    workspaceId = table.workspaceId;
  }
  const membership = await ctx.prisma.member.findFirst({
    where: {
      userId: ctx.session.user.id,
      workspaceId: workspaceId,
      role: {
        in: [MemberRole.owner, MemberRole.editor].concat(
          viewersIncluded ? [MemberRole.viewer] : ([] as any)
        ),
      },
    },
  });
  if (!membership) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
};

export const useOwnerCheck = async (ctx: Context, workspaceId: string) => {
  const membership = await ctx.prisma.member.findFirst({
    where: {
      userId: ctx.session!.user.id,
      workspaceId: workspaceId,
      role: {
        equals: MemberRole.owner,
      },
    },
  });
  if (!membership) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
};
