"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, Plus, X, Pencil, Check, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import {
  createCollection,
  updateCollection,
  deleteCollection,
  assignNoteToCollection,
  removeNoteFromCollection,
} from "@/services/collections";
import type { CollectionWithNotes } from "@/types/collection";

interface CollectionsPanelProps {
  projectId: string;
  collections: CollectionWithNotes[];
  onCollectionsChanged: (collections: CollectionWithNotes[]) => void;
  projectNotes: { id: string; title: string; category: string }[];
}

export function CollectionsPanel({
  projectId,
  collections,
  onCollectionsChanged,
  projectNotes,
}: CollectionsPanelProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [assigningTo, setAssigningTo] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setSaving(true);

    const { data, error } = await createCollection({
      project_id: projectId,
      name: newName.trim(),
      description: newDesc.trim() || undefined,
    });

    setSaving(false);

    if (!error && data) {
      onCollectionsChanged([...collections, { ...data, notes: [] }]);
      setNewName("");
      setNewDesc("");
      setAdding(false);
    }
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return;

    const { data, error } = await updateCollection(id, { name: editName.trim() });

    if (!error && data) {
      onCollectionsChanged(
        collections.map((c) =>
          c.id === id ? { ...c, name: data.name } : c
        )
      );
      setEditingId(null);
      setEditName("");
    }
  }

  async function handleDelete(id: string) {
    const { error } = await deleteCollection(id);
    if (!error) {
      onCollectionsChanged(collections.filter((c) => c.id !== id));
    }
  }

  async function handleAssign(noteId: string, collectionId: string) {
    const { error } = await assignNoteToCollection(noteId, collectionId);

    if (!error) {
      const note = projectNotes.find((n) => n.id === noteId);
      if (!note) return;

      onCollectionsChanged(
        collections.map((c) => {
          const filtered = c.notes.filter((n) => n.id !== noteId);
          if (c.id === collectionId) {
            return { ...c, notes: [...filtered, { id: note.id, title: note.title, category: note.category }] };
          }
          return { ...c, notes: filtered };
        })
      );
      setAssigningTo(null);
    }
  }

  async function handleRemove(noteId: string, collectionId: string) {
    const { error } = await removeNoteFromCollection(noteId, collectionId);
    if (!error) {
      onCollectionsChanged(
        collections.map((c) =>
          c.id === collectionId
            ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) }
            : c
        )
      );
    }
  }

  const assignedNoteIds = new Set(
    collections.flatMap((c) => c.notes.map((n) => n.id))
  );

  const unassignedNotes = projectNotes.filter((n) => !assignedNoteIds.has(n.id));

  return (
    <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#C9A84C]" />
          <h3 className="text-sm font-medium text-[#C9A84C]">
            Collections
            {collections.length > 0 && (
              <span className="ml-2 text-xs font-normal text-[#4A5A6A]">
                ({collections.length})
              </span>
            )}
          </h3>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-xs text-[#8A9BB0] hover:text-[#C9A84C] transition-colors"
          >
            <Plus className="h-3 w-3" />
            New
          </button>
        )}
      </div>

      {collections.length === 0 && !adding && (
        <p className="text-sm text-[#4A5A6A] italic">
          No collections yet. Group your notes into meaningful spaces.
        </p>
      )}

      {collections.length > 0 && (
        <ul className="space-y-2 mb-3">
          {collections.map((col) => (
            <li key={col.id} className="rounded-lg border border-[#2A3A52] bg-[#0F1623]">
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <button
                  onClick={() => toggleExpand(col.id)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  {expanded.has(col.id)
                    ? <ChevronDown className="h-3.5 w-3.5 text-[#4A5A6A] shrink-0" />
                    : <ChevronRight className="h-3.5 w-3.5 text-[#4A5A6A] shrink-0" />
                  }
                  {editingId === col.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 rounded bg-[#1A2333] border border-[#2A3A52] text-[#F5ECD7] text-sm px-2 py-0.5 focus:outline-none focus:border-[#C9A84C]"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-medium text-[#F5ECD7] truncate">
                      {col.name}
                    </span>
                  )}
                  <span className="text-xs text-[#4A5A6A] shrink-0">
                    {col.notes.length} note{col.notes.length !== 1 ? "s" : ""}
                  </span>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  {editingId === col.id ? (
                    <>
                      <button
                        onClick={() => handleRename(col.id)}
                        className="text-[#C9A84C] hover:text-[#D4B86A]"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-[#4A5A6A] hover:text-[#F5ECD7]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditingId(col.id); setEditName(col.name); }}
                        className="text-[#4A5A6A] hover:text-[#C9A84C] transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(col.id)}
                        className="text-[#4A5A6A] hover:text-red-400 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {expanded.has(col.id) && (
                <div className="px-3 pb-3 border-t border-[#2A3A52] pt-2 space-y-1">
                  {col.notes.length === 0 && (
                    <p className="text-xs text-[#4A5A6A] italic">No notes assigned.</p>
                  )}
                  {col.notes.map((note) => (
                    <div key={note.id} className="flex items-center justify-between gap-2 group">
                      <Link
                        href={"/projects/" + projectId + "/notes/" + note.id}
                        className="text-xs text-[#C9A84C] hover:underline truncate"
                      >
                        {note.title}
                      </Link>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-[#4A5A6A]">{note.category}</span>
                        <button
                          onClick={() => handleRemove(note.id, col.id)}
                          className="text-[#4A5A6A] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {unassignedNotes.length > 0 && (
                    assigningTo === col.id ? (
                      <div className="flex items-center gap-2 mt-2">
                        <select
                          onChange={(e) => handleAssign(e.target.value, col.id)}
                          className="flex-1 text-xs rounded bg-[#1A2333] border border-[#2A3A52] text-[#C8D6E5] px-2 py-1 focus:outline-none focus:border-[#C9A84C]"
                          defaultValue=""
                        >
                          <option value="" disabled>Select note...</option>
                          {unassignedNotes.map((n) => (
                            <option key={n.id} value={n.id}>{n.title}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => setAssigningTo(null)}
                          className="text-xs text-[#8A9BB0] hover:text-[#F5ECD7]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAssigningTo(col.id)}
                        className="inline-flex items-center gap-1 text-xs text-[#4A5A6A] hover:text-[#C9A84C] transition-colors mt-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add note
                      </button>
                    )
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <div className="space-y-2 border-t border-[#2A3A52] pt-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full rounded-lg bg-[#0F1623] border border-[#2A3A52] text-[#F5ECD7] text-sm px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
            placeholder="Collection name (e.g. Characters, Chapters, Research)"
            autoFocus
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full rounded-lg bg-[#0F1623] border border-[#2A3A52] text-[#F5ECD7] text-sm px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
            placeholder="Description (optional)"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreate}
              disabled={saving || !newName.trim()}
              className="inline-flex items-center gap-1 rounded-lg bg-[#C9A84C] px-3 py-1.5 text-xs font-medium text-[#0F1623] hover:bg-[#D4B86A] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Create
            </button>
            <button
              onClick={() => { setAdding(false); setNewName(""); setNewDesc(""); }}
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