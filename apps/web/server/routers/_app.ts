import superjson from "superjson";
import { createRouter } from "../createRouter";
import { cellRouter } from "./cells";
import { columnsRouter } from "./columns";
import { rowRouter } from "./rows";
import { tablesRouter } from "./tables";
import { workspaceRouter } from "./workspaces";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("workspace.", workspaceRouter)
  .merge("tables.", tablesRouter)
  .merge("columns.", columnsRouter)
  .merge("rows.", rowRouter)
  .merge("cells.", cellRouter);

export type AppRouter = typeof appRouter;
