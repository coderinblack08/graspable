import { z } from "zod";
import { useMemberCheck } from "../../lib/security-utils";
import { formObject } from "../../lib/validation";
import { createRouter } from "../createRouter";

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
          fields: true,
        },
      });
      return form;
    },
  })
  .mutation("create", {
    input: formObject,
    async resolve({ ctx, input }) {
      await useMemberCheck(ctx, { tableId: input.tableId }, false);
      return ctx.prisma.form.create({
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
      await ctx.prisma.$transaction([
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
    },
  });
