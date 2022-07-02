import { z } from "zod";

export const formObject = z.object({
  tableId: z.string(),
  name: z.string().min(1),
  description: z.string().min(1),
  authenticatedOnly: z.boolean(),
  singleSubmissionOnly: z.boolean(),
  fields: z.array(
    z.object({
      id: z.string().nullish(),
      label: z.string().min(1),
      description: z.string().nullish(),
      required: z.boolean(),
      columnId: z.string(),
    })
  ),
});
