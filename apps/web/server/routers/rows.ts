import { Filter, Row } from "@prisma/client";
import { Subscription } from "@trpc/server";
import SqlString from "sqlstring";
import { z } from "zod";
import { createRouter } from "../createRouter";
import { ee } from "../ee";

export const rowRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      function generateFilterClause({ columnId, operation, value }: Filter) {
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
      const filters = (
        await ctx.prisma.filter.findMany({
          where: { tableId: input.tableId },
        })
      ).filter((f) => f.columnId && f.value && f.operation);
      const sorts = (
        await ctx.prisma.sort.findMany({
          where: { tableId: input.tableId },
        })
      ).filter((f) => f.columnId && f.direction);
      return ctx.prisma.$queryRawUnsafe<Row[]>(
        `
        select r.* 
        from public."Row" r
        where r."tableId" = $1 ${
          filters.length > 0
            ? filters.map((filter) => generateFilterClause(filter)).join(" ")
            : ""
        }
        order by ${
          sorts.length
            ? sorts
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
  .subscription("onDelete", {
    input: z.object({
      tableId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<string[]>((emit) => {
        const onUpsert = ({
          ids,
          tableId,
        }: {
          ids: string[];
          tableId: string;
        }) => {
          emit.data(ids);
        };
        ee.on("row.delete", onUpsert);
        return () => {
          ee.off("row.delete", onUpsert);
        };
      });
    },
  })
  .subscription("onAdd", {
    input: z.object({
      tableId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<Row>((emit) => {
        const onUpsert = (data: Row) => {
          if (data.tableId === input.tableId) {
            emit.data(data);
          }
        };
        ee.on("row.add", onUpsert);
        return () => {
          ee.off("row.add", onUpsert);
        };
      });
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
      const row = await ctx.prisma.row.create({ data: input });
      ee.emit("row.add", row);
      return row;
    },
  })
  .mutation("delete", {
    input: z.object({
      tableId: z.string(),
      ids: z.array(z.string()),
    }),
    async resolve({ ctx, input }) {
      ee.emit("row.delete", input);
      return ctx.prisma.row.deleteMany({ where: { id: { in: input.ids } } });
    },
  });
