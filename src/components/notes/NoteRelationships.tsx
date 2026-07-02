"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, Plus, X, Loader2 } from "lucide-react";
import {
  createNoteRelationship,
  deleteNoteRelationship,
} from "@/services/relationships";
import type { NoteRelationshipWithNote, RelationshipType } from "@/types/relationship";

interface NoteRelationshipsProps {
  noteId: string;
  projectId: string;
  relationships: NoteRelationshipWithNote[];
  onRelationshipsChanged: (relationships: NoteRelationshipWithNote[]) => void;
  projectNotes: { id: string; title: string; category: string }[];
}

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  references: "References",
  related: "Related to",
};

export function NoteRelationships({
  noteId,
  projectId,
  relationships,
  onRelationshipsChanged,
  projectNotes,
}: NoteRelationshipsProps) {
  const [adding, setAdding] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [selectedType, setSelectedType] = useState<RelationshipType>("related");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const availableNotes = projectNotes.filter(
    (n) =>
      n.id !== noteId &&
      !relationships.some((r) => r.note?.id === n.id)
  );

  async function handleAdd() {
    if (!selectedNote) return;
    setSaving(true);
    setSaveError(null);

    const { data, error } = await createNoteRelationship({
      from_note_id: noteId,
      to_note_id: selectedNote,
      relationship_type: selectedType,
    });

    setSaving(false);

    if (error) {
      setSaveError(error);
      return;
    }

    if (data) {
      const linkedNote = projectNotes.find((n) => n.id === selectedNote);
      const newRel: NoteRelationshipWithNote = {
        ...data,
        note: {
          id: linkedNote?.id ?? selectedNote,
          title: linkedNote?.title ?? "Unknown",
          category: linkedNote?.category ?? "idea",
        },
      };
      onRelationshipsChanged([...relationships, newRel]);
      setSelectedNote("");
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    const { error } = await deleteNoteRelationship(id);
    if (!error) {
      onRelationshipsChanged(relationships.filter((r) => r.id !== id));
    }
  }

  return (
    <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-[#C9A84C]" />
          <h3 className="text-sm font-medium text-[#C9A84C]">
            Note Relationships
          </h3>
        </div>
        {!adding && availableNotes.length > 0 && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-xs text-[#8A9BB0] hover:text-[#C9A84C] transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        )}
      </div>

      {relationships.length === 0 && !adding && (
        <p className="text-sm text-[#4A5A6A] italic">
          No relationships yet. Connect this note to others in the project.
        </p>
      )}

      {relationships.length > 0 && (
        <ul className="space-y-2 mb-3">
          {relationships.map((rel) => (
            <li key={rel.id} className="flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-[#4A5A6A] shrink-0">
                  {RELATIONSHIP_LABELS[rel.relationship_type]}
                </span>
                <Link
                  href={"/projects/" + projectId + "/notes/" + rel.note?.id}
                  className="text-sm text-[#C9A84C] hover:underline truncate"
                >
                  {rel.note?.title ?? "Unknown"}
                </Link>
                {rel.note?.category && (
                  <span className="text-xs text-[#4A5A6A] shrink-0">
                    ({rel.note.category})
                  </span>
                )}
              </div>
              <button
                onClick={() => handleRemove(rel.id)}
                className="text-[#4A5A6A] hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <div className="space-y-2 mt-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as RelationshipType)}
              className="text-xs rounded bg-[#0F1623] border border-[#2A3A52] text-[#C8D6E5] px-2 py-2 focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="related">Related to</option>
              <option value="references">References</option>
            </select>
            <select
              value={selectedNote}
              onChange={(e) => setSelectedNote(e.target.value)}
              className="flex-1 text-xs rounded bg-[#0F1623] border border-[#2A3A52] text-[#C8D6E5] px-2 py-2 focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="" disabled>Select a note...</option>
              {availableNotes.map((n) => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
          </div>

          {saveError && (
            <p className="text-xs text-red-400">{saveError}</p>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              disabled={saving || !selectedNote}
              className="inline-flex items-center gap-1 rounded-lg bg-[#C9A84C] px-3 py-1.5 text-xs font-medium text-[#0F1623] hover:bg-[#D4B86A] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Add
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