"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, X, Loader2 } from "lucide-react";
import {
  createNoteIntentLink,
  deleteNoteIntentLink,
} from "@/services/relationships";
import type { NoteIntentLinkWithNote, IntentContext } from "@/types/relationship";

interface IntentLinksPanelProps {
  projectId: string;
  context: IntentContext;
  label: string;
  links: NoteIntentLinkWithNote[];
  onLinksChanged: (links: NoteIntentLinkWithNote[]) => void;
  projectNotes: { id: string; title: string; category: string }[];
}

export function IntentLinksPanel({
  projectId,
  context,
  label,
  links,
  onLinksChanged,
  projectNotes,
}: IntentLinksPanelProps) {
  const [adding, setAdding] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const linkedNoteIds = new Set(links.map((l) => l.note_id));
  const availableNotes = projectNotes.filter((n) => !linkedNoteIds.has(n.id));

  async function handleAdd() {
    if (!selectedNote) return;
    setSaving(true);
    setSaveError(null);

    const { data, error } = await createNoteIntentLink({
      project_id: projectId,
      note_id: selectedNote,
      context,
    });

    setSaving(false);

    if (error) {
      setSaveError(error);
      return;
    }

    if (data) {
      const linkedNote = projectNotes.find((n) => n.id === selectedNote);
      const newLink: NoteIntentLinkWithNote = {
        ...data,
        note: {
          id: linkedNote?.id ?? selectedNote,
          title: linkedNote?.title ?? "Unknown",
          category: linkedNote?.category ?? "idea",
        },
      };
      onLinksChanged([...links, newLink]);
      setSelectedNote("");
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    const { error } = await deleteNoteIntentLink(id);
    if (!error) {
      onLinksChanged(links.filter((l) => l.id !== id));
    }
  }

  if (links.length === 0 && availableNotes.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3 w-3 text-[#4A5A6A]" />
          <span className="text-xs text-[#4A5A6A]">{label}</span>
        </div>
        {!adding && availableNotes.length > 0 && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs text-[#4A5A6A] hover:text-[#C9A84C] transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>

      {links.length > 0 && (
        <ul className="space-y-1 mb-2">
          {links.map((link) => (
            <li key={link.id} className="flex items-center justify-between gap-2 group">
              <Link
                href={"/projects/" + projectId + "/notes/" + link.note_id}
                className="text-xs text-[#C9A84C] hover:underline truncate"
              >
                {link.note?.title ?? "Unknown"}
              </Link>
              <button
                onClick={() => handleRemove(link.id)}
                className="text-[#4A5A6A] hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <div className="space-y-1.5">
          <select
            value={selectedNote}
            onChange={(e) => setSelectedNote(e.target.value)}
            className="w-full text-xs rounded bg-[#0F1623] border border-[#2A3A52] text-[#C8D6E5] px-2 py-1.5 focus:outline-none focus:border-[#C9A84C]"
          >
            <option value="" disabled>Select a note...</option>
            {availableNotes.map((n) => (
              <option key={n.id} value={n.id}>{n.title}</option>
            ))}
          </select>

          {saveError && <p className="text-xs text-red-400">{saveError}</p>}

          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              disabled={saving || !selectedNote}
              className="inline-flex items-center gap-1 rounded bg-[#C9A84C] px-2 py-1 text-xs font-medium text-[#0F1623] hover:bg-[#D4B86A] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Link"}
            </button>
            <button
              onClick={() => { setAdding(false); setSelectedNote(""); setSaveError(null); }}
              className="text-xs text-[#8A9BB0] hover:text-[#F5ECD7]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}