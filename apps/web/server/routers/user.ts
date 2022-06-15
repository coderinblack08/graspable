import { z } from "zod";
import { createRouter } from "../createRouter";

export const userRouter = createRouter()
  .mutation("update-user", {
    input: z.object({
      username: z.string(),
      email: z.string().email(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma!.user.update({
        where: {
          email: input.email,
        },
        data: {
          // username: input.username,
        },
      });

      return { success: true, message: "Username set successfully" };
    },
  })
  .query("get-user", {
    input: z.object({
      email: z.string().email(),
    }),
    async resolve({ ctx, input }) {
      const user = await ctx.prisma!.user.findUnique({
        where: {
          email: input.email,
        },
      });

      return { success: true, user };
    },
  });
