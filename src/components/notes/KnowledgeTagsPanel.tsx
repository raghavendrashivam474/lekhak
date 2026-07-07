"use client";

import { useState } from "react";
import { Tag, Plus, X, Loader2 } from "lucide-react";
import {
  createTag,
  addTagToNote,
  removeTagFromNote,
} from "@/services/collections";
import type { KnowledgeTag, NoteTagWithTag } from "@/types/collection";

interface KnowledgeTagsPanelProps {
  noteId: string;
  projectId: string;
  noteTags: NoteTagWithTag[];
  projectTags: KnowledgeTag[];
  onNoteTagsChanged: (tags: NoteTagWithTag[]) => void;
  onProjectTagsChanged: (tags: KnowledgeTag[]) => void;
}

const SUGGESTED_TAGS = [
  "conflict", "theme", "emotion", "foreshadowing",
  "character arc", "mystery", "dialogue", "setting", "world building",
];

export function KnowledgeTagsPanel({
  noteId,
  projectId,
  noteTags,
  projectTags,
  onNoteTagsChanged,
  onProjectTagsChanged,
}: KnowledgeTagsPanelProps) {
  const [adding, setAdding] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appliedTagIds = new Set(noteTags.map((nt) => nt.tag_id));
  const availableTags = projectTags.filter((t) => !appliedTagIds.has(t.id));

  async function handleApplyExisting(tag: KnowledgeTag) {
    const { error } = await addTagToNote(noteId, tag.id);
    if (!error) {
      const newNoteTag: NoteTagWithTag = {
        id: crypto.randomUUID(),
        user_id: "",
        note_id: noteId,
        tag_id: tag.id,
        created_at: new Date().toISOString(),
        tag,
      };
      onNoteTagsChanged([...noteTags, newNoteTag]);
    }
  }

  async function handleCreateAndApply() {
    if (!newTagName.trim()) return;
    setSaving(true);
    setError(null);

    const { data: newTag, error: createError } = await createTag(projectId, newTagName.trim());

    if (createError) {
      // Tag may already exist — find it
      const existing = projectTags.find(
        (t) => t.name === newTagName.trim().toLowerCase()
      );
      if (existing) {
        await handleApplyExisting(existing);
        setNewTagName("");
        setAdding(false);
        setSaving(false);
        return;
      }
      setError(createError);
      setSaving(false);
      return;
    }

    if (newTag) {
      onProjectTagsChanged([...projectTags, newTag]);
      const { error: applyError } = await addTagToNote(noteId, newTag.id);

      if (!applyError) {
        const newNoteTag: NoteTagWithTag = {
          id: crypto.randomUUID(),
          user_id: "",
          note_id: noteId,
          tag_id: newTag.id,
          created_at: new Date().toISOString(),
          tag: newTag,
        };
        onNoteTagsChanged([...noteTags, newNoteTag]);
      }
    }

    setNewTagName("");
    setAdding(false);
    setSaving(false);
  }

  async function handleRemove(noteTag: NoteTagWithTag) {
    const { error } = await removeTagFromNote(noteId, noteTag.tag_id);
    if (!error) {
      onNoteTagsChanged(noteTags.filter((nt) => nt.tag_id !== noteTag.tag_id));
    }
  }

  return (
    <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-[#C9A84C]" />
          <h3 className="text-sm font-medium text-[#C9A84C]">Knowledge Tags</h3>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-xs text-[#8A9BB0] hover:text-[#C9A84C] transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        )}
      </div>

      {noteTags.length === 0 && !adding && (
        <p className="text-sm text-[#4A5A6A] italic">
          No tags yet. Add semantic tags to describe what this note represents.
        </p>
      )}

      {noteTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {noteTags.map((nt) => (
            <span
              key={nt.tag_id}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0F1623] border border-[#2A3A52] px-3 py-1 text-xs text-[#C8D6E5]"
            >
              {nt.tag.name}
              <button
                onClick={() => handleRemove(nt)}
                className="text-[#4A5A6A] hover:text-red-400 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {adding && (
        <div className="space-y-3 border-t border-[#2A3A52] pt-3">
          {availableTags.length > 0 && (
            <div>
              <p className="text-xs text-[#4A5A6A] mb-2">Existing tags</p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => { handleApplyExisting(tag); setAdding(false); }}
                    className="inline-flex items-center rounded-full bg-[#0F1623] border border-[#2A3A52] px-3 py-1 text-xs text-[#8A9BB0] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-[#4A5A6A] mb-2">Create new tag</p>
            <div className="flex items-center gap-2">
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                list="tag-suggestions"
                className="flex-1 rounded-lg bg-[#0F1623] border border-[#2A3A52] text-[#F5ECD7] text-sm px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
                placeholder="e.g. conflict, foreshadowing..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateAndApply();
                  }
                }}
              />
              <datalist id="tag-suggestions">
                {SUGGESTED_TAGS.filter(
                  (s) => !projectTags.some((t) => t.name === s)
                ).map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <button
                onClick={handleCreateAndApply}
                disabled={saving || !newTagName.trim()}
                className="inline-flex items-center gap-1 rounded-lg bg-[#C9A84C] px-3 py-2 text-xs font-medium text-[#0F1623] hover:bg-[#D4B86A] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
              </button>
            </div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>

          <button
            onClick={() => { setAdding(false); setNewTagName(""); setError(null); }}
            className="text-xs text-[#8A9BB0] hover:text-[#F5ECD7]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}