"use client";

import { useState } from "react";
import { Target, Focus, ArrowRight, HelpCircle, Plus, X, Loader2, Check } from "lucide-react";
import { updateProjectIntent } from "@/services/projects";
import type { Project } from "@/types/project";

interface IntentPanelProps {
  project: Project;
  onProjectUpdated: (project: Project) => void;
}

type EditingField = "goal" | "current_focus" | "next_step" | null;

export function IntentPanel({ project, onProjectUpdated }: IntentPanelProps) {
  const [editing, setEditing] = useState<EditingField>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  function startEditing(field: EditingField) {
    if (!field) return;
    setEditing(field);
    setEditValue(project[field] ?? "");
  }

  function cancelEditing() {
    setEditing(null);
    setEditValue("");
  }

  async function saveField() {
    if (!editing) return;
    setSaving(true);

    const { data, error } = await updateProjectIntent(project.id, {
      [editing]: editValue,
    });

    setSaving(false);

    if (!error && data) {
      onProjectUpdated(data);
      setEditing(null);
      setEditValue("");
    }
  }

  async function addQuestion() {
    if (!newQuestion.trim()) return;
    setSavingQuestion(true);

    const current = project.open_questions ?? [];
    const updated = [...current, newQuestion.trim()];

    const { data, error } = await updateProjectIntent(project.id, {
      open_questions: updated,
    });

    setSavingQuestion(false);

    if (!error && data) {
      onProjectUpdated(data);
      setNewQuestion("");
      setAddingQuestion(false);
    }
  }

  async function removeQuestion(index: number) {
    const current = project.open_questions ?? [];
    const updated = current.filter((_, i) => i !== index);

    const { data, error } = await updateProjectIntent(project.id, {
      open_questions: updated,
    });

    if (!error && data) {
      onProjectUpdated(data);
    }
  }

  const hasAnyIntent =
    project.goal ||
    project.current_focus ||
    project.next_step ||
    (project.open_questions && project.open_questions.length > 0);

  return (
    <div className="space-y-4">

      {/* Goal */}
      <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-[#C9A84C]" />
          <h3 className="text-sm font-medium text-[#C9A84C]">Project Goal</h3>
        </div>

        {editing === "goal" ? (
          <div className="space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={2}
              maxLength={500}
              className="w-full rounded-lg bg-[#0F1623] border border-[#2A3A52] text-[#F5ECD7] text-sm px-3 py-2 focus:outline-none focus:border-[#C9A84C] resize-none"
              placeholder="What is the long-term objective of this project?"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={saveField}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-lg bg-[#C9A84C] px-3 py-1.5 text-xs font-medium text-[#0F1623] hover:bg-[#D4B86A] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Save
              </button>
              <button
                onClick={cancelEditing}
                disabled={saving}
                className="text-xs text-[#8A9BB0] hover:text-[#F5ECD7]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => startEditing("goal")}
            className="w-full text-left"
          >
            {project.goal ? (
              <p className="text-sm text-[#C8D6E5] leading-relaxed">{project.goal}</p>
            ) : (
              <p className="text-sm text-[#4A5A6A] italic">Click to set a project goal...</p>
            )}
          </button>
        )}
      </div>

      {/* Current Focus */}
      <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Focus className="h-4 w-4 text-[#C9A84C]" />
          <h3 className="text-sm font-medium text-[#C9A84C]">Current Focus</h3>
        </div>

        {editing === "current_focus" ? (
          <div className="space-y-2">
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              maxLength={300}
              className="w-full rounded-lg bg-[#0F1623] border border-[#2A3A52] text-[#F5ECD7] text-sm px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
              placeholder="What are you concentrating on right now?"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={saveField}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-lg bg-[#C9A84C] px-3 py-1.5 text-xs font-medium text-[#0F1623] hover:bg-[#D4B86A] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Save
              </button>
              <button
                onClick={cancelEditing}
                disabled={saving}
                className="text-xs text-[#8A9BB0] hover:text-[#F5ECD7]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => startEditing("current_focus")}
            className="w-full text-left"
          >
            {project.current_focus ? (
              <p className="text-sm text-[#C8D6E5]">{project.current_focus}</p>
            ) : (
              <p className="text-sm text-[#4A5A6A] italic">Click to set your current focus...</p>
            )}
          </button>
        )}
      </div>

      {/* Next Step */}
      <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
        <div className="flex items-center gap-2 mb-3">
          <ArrowRight className="h-4 w-4 text-[#C9A84C]" />
          <h3 className="text-sm font-medium text-[#C9A84C]">Next Writing Step</h3>
        </div>

        {editing === "next_step" ? (
          <div className="space-y-2">
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              maxLength={300}
              className="w-full rounded-lg bg-[#0F1623] border border-[#2A3A52] text-[#F5ECD7] text-sm px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
              placeholder="What is the one next thing to do?"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={saveField}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-lg bg-[#C9A84C] px-3 py-1.5 text-xs font-medium text-[#0F1623] hover:bg-[#D4B86A] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Save
              </button>
              <button
                onClick={cancelEditing}
                disabled={saving}
                className="text-xs text-[#8A9BB0] hover:text-[#F5ECD7]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => startEditing("next_step")}
            className="w-full text-left"
          >
            {project.next_step ? (
              <p className="text-sm text-[#C8D6E5]">{project.next_step}</p>
            ) : (
              <p className="text-sm text-[#4A5A6A] italic">Click to set your next step...</p>
            )}
          </button>
        )}
      </div>

      {/* Open Questions */}
      <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-[#C9A84C]" />
            <h3 className="text-sm font-medium text-[#C9A84C]">Open Questions</h3>
          </div>
          {!addingQuestion && (
            <button
              onClick={() => setAddingQuestion(true)}
              className="inline-flex items-center gap-1 text-xs text-[#8A9BB0] hover:text-[#C9A84C] transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          )}
        </div>

        {(!project.open_questions || project.open_questions.length === 0) && !addingQuestion && (
          <button
            onClick={() => setAddingQuestion(true)}
            className="w-full text-left"
          >
            <p className="text-sm text-[#4A5A6A] italic">Click to add creative questions...</p>
          </button>
        )}

        {project.open_questions && project.open_questions.length > 0 && (
          <ul className="space-y-2 mb-3">
            {project.open_questions.map((q, i) => (
              <li key={i} className="flex items-start justify-between gap-3 group">
                <p className="text-sm text-[#C8D6E5] leading-relaxed">{q}</p>
                <button
                  onClick={() => removeQuestion(i)}
                  className="text-[#4A5A6A] hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100 mt-0.5"
                  title="Remove question"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {addingQuestion && (
          <div className="space-y-2">
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full rounded-lg bg-[#0F1623] border border-[#2A3A52] text-[#F5ECD7] text-sm px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
              placeholder="What creative question needs answering?"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addQuestion();
                }
              }}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={addQuestion}
                disabled={savingQuestion || !newQuestion.trim()}
                className="inline-flex items-center gap-1 rounded-lg bg-[#C9A84C] px-3 py-1.5 text-xs font-medium text-[#0F1623] hover:bg-[#D4B86A] disabled:opacity-50"
              >
                {savingQuestion ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                Add
              </button>
              <button
                onClick={() => {
                  setAddingQuestion(false);
                  setNewQuestion("");
                }}
                disabled={savingQuestion}
                className="text-xs text-[#8A9BB0] hover:text-[#F5ECD7]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}