import { z } from "zod";

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title must be 100 characters or fewer.")
    .trim(),

  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),
});

export const updateProjectSchema = createProjectSchema.partial();

export const intentFieldSchema = z.object({
  goal: z
    .string()
    .max(500, "Goal must be 500 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),

  current_focus: z
    .string()
    .max(300, "Current focus must be 300 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),

  next_step: z
    .string()
    .max(300, "Next step must be 300 characters or fewer.")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
export type IntentFieldFormValues = z.infer<typeof intentFieldSchema>;