"use client";

import { useState } from "react";
import { Target, Focus, ArrowRight, Loader2, Check } from "lucide-react";
import { updateProjectIntent } from "@/services/projects";
import { IntentLinksPanel } from "@/components/projects/IntentLinksPanel";
import type { Project } from "@/types/project";
import type { NoteIntentLinkWithNote } from "@/types/relationship";

interface IntentPanelProps {
  project: Project;
  onProjectUpdated: (project: Project) => void;
  goalLinks: NoteIntentLinkWithNote[];
  focusLinks: NoteIntentLinkWithNote[];
  nextStepLinks: NoteIntentLinkWithNote[];
  onGoalLinksChanged: (links: NoteIntentLinkWithNote[]) => void;
  onFocusLinksChanged: (links: NoteIntentLinkWithNote[]) => void;
  onNextStepLinksChanged: (links: NoteIntentLinkWithNote[]) => void;
  projectNotes: { id: string; title: string; category: string }[];
}

type EditingField = "goal" | "current_focus" | "next_step" | null;

export function IntentPanel({
  project,
  onProjectUpdated,
  goalLinks,
  focusLinks,
  nextStepLinks,
  onGoalLinksChanged,
  onFocusLinksChanged,
  onNextStepLinksChanged,
  projectNotes,
}: IntentPanelProps) {
  const [editing, setEditing] = useState<EditingField>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="space-y-4">

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
              <button onClick={cancelEditing} disabled={saving} className="text-xs text-[#8A9BB0] hover:text-[#F5ECD7]">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => startEditing("goal")} className="w-full text-left">
            {project.goal ? (
              <p className="text-sm text-[#C8D6E5] leading-relaxed">{project.goal}</p>
            ) : (
              <p className="text-sm text-[#4A5A6A] italic">Click to set a project goal...</p>
            )}
          </button>
        )}

        <IntentLinksPanel
          projectId={project.id}
          context="goal"
          label="Supported by"
          links={goalLinks}
          onLinksChanged={onGoalLinksChanged}
          projectNotes={projectNotes}
        />
      </div>

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
              <button onClick={cancelEditing} disabled={saving} className="text-xs text-[#8A9BB0] hover:text-[#F5ECD7]">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => startEditing("current_focus")} className="w-full text-left">
            {project.current_focus ? (
              <p className="text-sm text-[#C8D6E5]">{project.current_focus}</p>
            ) : (
              <p className="text-sm text-[#4A5A6A] italic">Click to set your current focus...</p>
            )}
          </button>
        )}

        <IntentLinksPanel
          projectId={project.id}
          context="focus"
          label="Related notes"
          links={focusLinks}
          onLinksChanged={onFocusLinksChanged}
          projectNotes={projectNotes}
        />
      </div>

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
              <button onClick={cancelEditing} disabled={saving} className="text-xs text-[#8A9BB0] hover:text-[#F5ECD7]">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => startEditing("next_step")} className="w-full text-left">
            {project.next_step ? (
              <p className="text-sm text-[#C8D6E5]">{project.next_step}</p>
            ) : (
              <p className="text-sm text-[#4A5A6A] italic">Click to set your next step...</p>
            )}
          </button>
        )}

        <IntentLinksPanel
          projectId={project.id}
          context="next_step"
          label="Required notes"
          links={nextStepLinks}
          onLinksChanged={onNextStepLinksChanged}
          projectNotes={projectNotes}
        />
      </div>

    </div>
  );
}