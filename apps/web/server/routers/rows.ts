import { Row } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "../createRouter";
import SqlString from "sqlstring";

const zodFilter = z.object({
  columnId: z.string(),
  operation: z.enum([
    "equals",
    "contains",
    "checked",
    "unchecked",
    "startsWith",
    "endsWith",
    "gt",
    "lt",
  ]),
  value: z.string(),
});

export const rowRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
      sorts: z.array(
        z.object({ columnId: z.string(), direction: z.enum(["asc", "desc"]) })
      ),
      filters: z.array(zodFilter),
    }),
    async resolve({ ctx, input }) {
      function generateFilterClause({
        columnId,
        operation,
        value,
      }: z.infer<typeof zodFilter>) {
        const cellSubQuery = `(select c.value from public."Cell" c where c."columnId" = ${SqlString.escape(
          columnId
        )} and c."rowId" = r.id)`;

        switch (operation) {
          case "gt":
            return `and ${SqlString.escape(value)}::int < ${cellSubQuery}::int`;
          case "lt":
            return `and ${SqlString.escape(value)}::int > ${cellSubQuery}::int`;
          case "equals":
            return `and ${SqlString.escape(value)} = ${cellSubQuery}`;
          case "unchecked":
            return `and (not exists ${cellSubQuery} or 'false' = ${cellSubQuery})`;
          case "checked":
            return `and 'true' = ${cellSubQuery}`;
          case "startsWith":
          case "endsWith":
          case "contains":
            return `and ${cellSubQuery} ilike ${
              operation === "endsWith" || operation === "contains"
                ? "'%' || "
                : ""
            }${SqlString.escape(value)}${
              operation === "contains" || operation === "startsWith"
                ? " || '%'"
                : ""
            }`;
        }
      }
      return ctx.prisma.$queryRawUnsafe<Row[]>(
        `
        select r.* 
        from public."Row" r
        where r."tableId" = $1 ${
          input.filters.length > 0
            ? input.filters
                .map((filter) => generateFilterClause(filter))
                .join(" ")
            : ""
        }
        order by ${
          input.sorts.length
            ? input.sorts
                .map(
                  ({ direction, columnId }) =>
                    `(select c.value from public."Cell" c where c."rowId" = r."id" and c."columnId" = ${SqlString.escape(
                      columnId
                    )}) ${direction}`
                )
                .join(", ")
            : `r.rank collate "C"`
        }`,
        ...[input.tableId]
      );
    },
  })
  .mutation("updateRank", {
    input: z.object({
      id: z.string(),
      rank: z.string(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.row.update({
        where: { id: input.id },
        data: { rank: input.rank },
      });
    },
  })
  .mutation("add", {
    input: z.object({
      tableId: z.string(),
      rank: z.string(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.row.create({ data: input });
    },
  })
  .mutation("delete", {
    input: z.object({
      ids: z.array(z.string()),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.row.deleteMany({ where: { id: { in: input.ids } } });
    },
  });
