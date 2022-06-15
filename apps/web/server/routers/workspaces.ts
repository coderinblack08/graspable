import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter } from "../createRouter";
import { ColumnType, MemberRole } from "@prisma/client";
import { LexoRank } from "lexorank";

export const workspaceRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
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
        })
      ).filter((w) => !w.deleted);
    },
  })
  .query("byId", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
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
          ownerId: ctx.session!.user!.id,
          Table: {
            create: {
              name: "Table 1",
            },
          },
        },
        include: {
          Table: true,
        },
      });
      await ctx.prisma.member.create({
        data: {
          role: MemberRole.owner,
          userId: ctx.session!.user!.id,
          workspaceId: workspace.id,
        },
      });
      const { id: tableId } = workspace.Table[0];
      let firstRank = LexoRank.middle();
      const generateNextRank = () => (firstRank = firstRank.genNext());
      const columns = await ctx.prisma.column.createMany({
        data: [
          {
            name: "Task",
            type: ColumnType.text,
            rank: firstRank.toString(),
            tableId,
          },
          {
            name: "Status",
            type: ColumnType.dropdown,
            rank: generateNextRank().toString(),
            dropdownOptions: ["Todo", "In Progress", "Done"],
            tableId,
          },
          {
            name: "Due Date",
            rank: generateNextRank().toString(),
            type: ColumnType.date,
            tableId,
          },
        ],
      });
      firstRank = LexoRank.middle();
      const rows = await ctx.prisma.row.createMany({
        data: [
          {
            rank: firstRank.toString(),
            tableId,
          },
          {
            rank: generateNextRank().toString(),
            tableId,
          },
          {
            rank: generateNextRank().toString(),
            tableId,
          },
        ],
      });
      return { ...workspace, columns, rows };
    },
  })
  .mutation("delete", {
    input: z.object({ id: z.string() }),
    async resolve({ ctx, input }) {
      return ctx.prisma.workspace.update({
        where: { id: input.id },
        data: { deleted: true },
      });
    },
  });
