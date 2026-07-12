import { z } from "zod";

export const NOTE_CATEGORIES = [
  "idea",
  "scene",
  "outline",
  "dialogue",
  "research",
  "character",
  "theme",
  "worldbuilding",
  "revision",
] as const;

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

  category: z.enum(NOTE_CATEGORIES).default("idea"),
});

export const updateNoteSchema = createNoteSchema.partial();

// z.infer gives the PARSED (output) shape.
// useForm/zodResolver needs the INPUT shape.
export type CreateNoteFormInput = z.input<typeof createNoteSchema>;
export type CreateNoteFormValues = z.output<typeof createNoteSchema>;
export type UpdateNoteFormInput = z.input<typeof updateNoteSchema>;
export type UpdateNoteFormValues = z.output<typeof updateNoteSchema>;