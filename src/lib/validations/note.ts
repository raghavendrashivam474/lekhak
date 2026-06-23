import { z } from "zod";

export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(200, "Title must be 200 characters or fewer.")
    .trim(),

  content: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export const updateNoteSchema = createNoteSchema;

export type CreateNoteFormValues = z.infer<typeof createNoteSchema>;
export type UpdateNoteFormValues = z.infer<typeof updateNoteSchema>;
