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

export type CreateNoteFormValues = z.infer<typeof createNoteSchema>;
export type UpdateNoteFormValues = z.infer<typeof updateNoteSchema>;