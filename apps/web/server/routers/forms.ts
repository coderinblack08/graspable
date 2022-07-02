import { Form } from "@prisma/client";
import { Subscription, TRPCError } from "@trpc/server";
import { LexoRank } from "lexorank";
import { z } from "zod";
import { useMemberCheck } from "../../lib/security-utils";
import { formObject } from "../../lib/validation";
import { createRouter } from "../createRouter";
import { ee } from "../ee";

export const formRouter = createRouter()
  .query("byTableId", {
    input: z.object({
      tableId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const form = await ctx.prisma.form.findFirst({
        where: {
          tableId: input.tableId,
        },
        include: {
          fields: {
            include: {
              Column: true,
            },
          },
        },
      });
      return form;
    },
  })
  .mutation("submit", {
    input: z.object({
      formId: z.string(),
      data: z.any(),
    }),
    async resolve({ ctx, input }) {
      const form = await ctx.prisma.form.findFirst({
        where: {
          id: input.formId,
        },
        include: {
          fields: {
            include: {
              Column: true,
            },
          },
        },
      });
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (form.authenticatedOnly && !ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Form requires authentication",
        });
      }
      if (form.authenticatedOnly) {
        if (form.singleSubmissionOnly) {
          const existingSubmission =
            await ctx.prisma.authenticatedSubmission.findFirst({
              where: {
                formId: form.id,
                userId: ctx.session!.user.id,
              },
            });
          if (existingSubmission) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Form already submitted",
            });
          }
        }
      }
      const lastRowRank = await ctx.prisma.$queryRaw<
        { max: string }[]
      >`select max(rank) from "Row" where "tableId" = ${form.tableId}`;
      const row = await ctx.prisma.row.create({
        data: {
          rank: LexoRank.parse(lastRowRank[0].max).genNext().toString(),
          tableId: form.tableId,
        },
      });
      ee.emit("row.add", row);
      for (const field of form.fields) {
        let value = input.data[field.columnId];
        if (value instanceof Array) {
          value = JSON.stringify(value);
        }
        if (typeof value === "boolean" || typeof value === "number") {
          value = value.toString();
        }
        if (!value && field.required) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `${field.label} is required`,
          });
        }
        const cell = await ctx.prisma.cell.create({
          data: {
            rowId: row.id,
            columnId: field.Column.id,
            tableId: form.tableId,
            value,
          },
        });
        ee.emit("cell.upsert", cell);
      }
      if (form.authenticatedOnly) {
        await ctx.prisma.authenticatedSubmission.create({
          data: {
            userId: ctx.session!.user.id,
            formId: form.id,
            rowId: row.id,
          },
        });
      }
      return true;
    },
  })
  .subscription("onCreate", {
    input: z.object({
      tableId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<Form>((emit) => {
        const onCreate = async (form: Form) => {
          if (form.tableId === input.tableId) {
            emit.data(form);
          }
        };
        ee.on("form.create", onCreate);
        return () => {
          ee.off("form.create", onCreate);
        };
      });
    },
  })
  .subscription("onUpdate", {
    input: z.object({
      tableId: z.string(),
    }),
    resolve({ input }) {
      return new Subscription<Form>((emit) => {
        const onUpdate = async (form: Form) => {
          if (form.tableId === input.tableId) {
            emit.data(form);
          }
        };
        ee.on("form.update", onUpdate);
        return () => {
          ee.off("form.update", onUpdate);
        };
      });
    },
  })
  .mutation("create", {
    input: formObject,
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, false);
      const form = await ctx.prisma.form.create({
        data: {
          tableId: input.tableId,
          name: input.name,
          description: input.description,
          authenticatedOnly: input.authenticatedOnly,
          singleSubmissionOnly: input.singleSubmissionOnly,
          fields: {
            createMany: {
              data: input.fields.map((field) => ({
                label: field.label,
                description: field.description,
                required: field.required,
                columnId: field.columnId,
              })),
            },
          },
        },
        include: { fields: true },
      });
      ee.emit("form.create", form);
      return form;
    },
  })
  .mutation("update", {
    input: formObject.partial(),
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, false);
      const fields = [];
      for (const field of input.fields || []) {
        if (field.id) {
          fields.push(
            ctx.prisma.formField.update({
              where: { id: field.id },
              data: {
                label: field.label,
                description: field.description,
                required: field.required,
                columnId: field.columnId,
              },
            })
          );
        }
      }
      const [form, ...otherFields] = await ctx.prisma.$transaction([
        ctx.prisma.form.update({
          where: { tableId: input.tableId },
          data: {
            name: input.name,
            description: input.description,
            authenticatedOnly: input.authenticatedOnly,
            singleSubmissionOnly: input.singleSubmissionOnly,
          },
        }),
        ...fields,
      ]);
      ee.emit("form.update", {
        ...form,
        fields: otherFields,
      });
    },
  });
