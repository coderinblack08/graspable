import superjson from "superjson";
import { createRouter } from "../createRouter";
import { workspaceRouter } from "./workspaces";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("workspace", workspaceRouter);

export type AppRouter = typeof appRouter;
