"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Note } from "@/types/note";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });

      if (data) setNotes(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#F5ECD7]">
          All Notes
        </h1>
        <p className="text-[#8A9BB0] text-sm mt-1">
          Every note across all your projects.
        </p>
      </div>

      {loading && (
        <p className="text-[#8A9BB0] text-sm">Loading notes...</p>
      )}

      {!loading && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileText className="h-10 w-10 text-[#4A5A6A] mb-4" />
          <h2 className="text-lg font-medium text-[#F5ECD7] mb-1">
            No notes yet
          </h2>
          <p className="text-[#8A9BB0] text-sm max-w-xs">
            Create a note inside any project to get started.
          </p>
        </div>
      )}

      {!loading && notes.length > 0 && (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id}>
              <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-medium text-[#F5ECD7] truncate">
                      {note.title}
                    </h3>
                    {note.content && (
                      <p className="text-[#8A9BB0] text-sm mt-1 line-clamp-3 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-[#4A5A6A] whitespace-nowrap shrink-0 mt-0.5">
                    {formatDistanceToNow(new Date(note.updated_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
