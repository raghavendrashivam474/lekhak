"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { updateProject } from "@/services/projects";
import {
  updateProjectSchema,
  type UpdateProjectFormValues,
} from "@/lib/validations/project";
import type { Project } from "@/types/project";

interface EditProjectDialogProps {
  project: Project;
  onProjectUpdated: (project: Project) => void;
}

export function EditProjectDialog({
  project,
  onProjectUpdated,
}: EditProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      title: project.title,
      description: project.description ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      title: project.title,
      description: project.description ?? "",
    });
  }, [project, form]);

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: UpdateProjectFormValues) {
    setServerError(null);

    const { data, error } = await updateProject(project.id, {
      title: values.title,
      description: values.description || undefined,
    });

    if (error) {
      setServerError(error);
      return;
    }

    onProjectUpdated(data);
    setOpen(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setServerError(null);
      form.reset({
        title: project.title,
        description: project.description ?? "",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-lg border border-[#2A3A52] bg-transparent px-4 py-2 text-sm font-medium text-[#C8D6E5] transition-colors hover:bg-[#2A3A52] hover:text-[#F5ECD7]">
        <Pencil className="mr-2 h-4 w-4" />
        Edit Project
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>
            Update the title or description of this project.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description{" "}
                    <span className="text-[#4A5A6A] font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (
              <p className="text-sm text-red-400">{serverError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
