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

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;