import superjson from "superjson";
import { createRouter } from "../createRouter";
import { workspaceRouter } from "./workspaces";

export const appRouter = createRouter()
  .transformer(superjson)
  .query("hello", {
    resolve({ ctx }) {
      return {
        greeting: `hello world`,
      };
    },
  })
  .merge("workspace.", workspaceRouter);

export type AppRouter = typeof appRouter;
