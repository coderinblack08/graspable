import superjson from "superjson";
import { createRouter } from "../createRouter";
import { cellRouter } from "./cells";
import { columnsRouter } from "./columns";
import { filterRouter } from "./filters";
import { rowRouter } from "./rows";
import { sortRouter } from "./sorts";
import { tablesRouter } from "./tables";
import { workspaceRouter } from "./workspaces";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("workspace.", workspaceRouter)
  .merge("tables.", tablesRouter)
  .merge("columns.", columnsRouter)
  .merge("rows.", rowRouter)
  .merge("cells.", cellRouter)
  .merge("filters.", filterRouter)
  .merge("sorts.", sortRouter);

export type AppRouter = typeof appRouter;
