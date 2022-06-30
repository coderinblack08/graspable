import { MemberRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Context } from "../server/context";

export const useMemberCheck = async (
  ctx: Context,
  { workspaceId, tableId }: { workspaceId?: string; tableId?: string },
  viewersIncluded = true
) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (tableId) {
    const table = await ctx.prisma.table.findFirst({
      where: { id: tableId },
    });
    if (!table) {
      throw new TRPCError({ code: "NOT_FOUND" });
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
