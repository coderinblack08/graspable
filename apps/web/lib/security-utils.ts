import { MemberRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Context } from "../server/context";

export const useMemberCheck = async (
  ctx: Context,
  workspaceId: string,
  viewersIncluded = true
) => {
  const membership = await ctx.prisma.member.findFirst({
    where: {
      userId: ctx.session!.user.id,
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
