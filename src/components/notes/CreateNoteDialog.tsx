"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
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
import { createNote } from "@/services/notes";
import {
  createNoteSchema,
  NOTE_CATEGORIES,
  type CreateNoteFormValues,
} from "@/lib/validations/note";
import type { Note } from "@/types/note";

interface CreateNoteDialogProps {
  projectId: string;
  onNoteCreated: (note: Note) => void;
}

export function CreateNoteDialog({ projectId, onNoteCreated }: CreateNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateNoteFormValues>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: { title: "", content: "", category: "idea" },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: CreateNoteFormValues) {
    setServerError(null);

    const { data, error } = await createNote({
      title: values.title,
      content: values.content || undefined,
      project_id: projectId,
      category: values.category,
    });

    if (error) { setServerError(error); return; }

    onNoteCreated(data);
    setOpen(false);
    form.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) { setServerError(null); form.reset(); }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-medium text-[#0F1623] transition-colors hover:bg-[#D4B86A]">
        <Plus className="mr-2 h-4 w-4" />
        New Note
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create a new note</DialogTitle>
          <DialogDescription>
            Capture an idea, a scene, a thought. You can always edit later.
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
                    <Input placeholder="Chapter 1, Character sketch..." autoComplete="off" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-[#0F1623] border border-[#2A3A52] text-[#F5ECD7] text-sm px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
                    >
                      {NOTE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content <span className="text-[#4A5A6A] font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write anything..." rows={5} disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && <p className="text-sm text-red-400">{serverError}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Creating..." : "Create Note"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}