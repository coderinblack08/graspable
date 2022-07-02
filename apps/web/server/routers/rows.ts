import { Filter, Row } from "@prisma/client";
import { Subscription, TRPCError } from "@trpc/server";
import SqlString from "sqlstring";
import { z } from "zod";
import { useMemberCheck } from "../../lib/security-utils";
import { createRouter } from "../createRouter";
import { ee } from "../ee";

export const rowRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, true);
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
      ).filter((f) => f.columnId && f.operation);
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
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, true);
      return new Subscription<string[]>((emit) => {
        const onUpsert = ({
          ids,
          tableId,
        }: {
          ids: string[];
          tableId: string;
        }) => {
          if (tableId === input.tableId) {
            emit.data(ids);
          }
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
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, true);
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
  .subscription("onUpdateRank", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, true);
      return new Subscription<Row>((emit) => {
        const onUpsert = (data: Row) => {
          if (data.tableId === input.tableId) {
            emit.data(data);
          }
        };
        ee.on("row.updateRank", onUpsert);
        return () => {
          ee.off("row.updateRank", onUpsert);
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
      const row = await ctx.prisma.row.findFirst({
        where: { id: input.id },
      });
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await useMemberCheck(ctx, { tableId: row.tableId }, false);
      const newRow = await ctx.prisma.row.update({
        where: { id: input.id },
        data: { rank: input.rank },
      });
      ee.emit("row.updateRank", newRow);
      return newRow;
    },
  })
  .mutation("add", {
    input: z.object({
      tableId: z.string(),
      rank: z.string(),
    }),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, false);
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
      await useMemberCheck(ctx, { tableId: input.tableId }, false);
      ee.emit("row.delete", input);
      return ctx.prisma.row.deleteMany({ where: { id: { in: input.ids } } });
    },
  });
