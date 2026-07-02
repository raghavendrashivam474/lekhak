"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, Plus, X, Check, Loader2, ChevronDown } from "lucide-react";
import {
  createQuestion,
  updateQuestionStatus,
  deleteQuestion,
} from "@/services/relationships";
import type { QuestionWithNote, QuestionStatus } from "@/types/relationship";

interface QuestionsPanelProps {
  projectId: string;
  questions: QuestionWithNote[];
  onQuestionsChanged: (questions: QuestionWithNote[]) => void;
  projectNotes: { id: string; title: string }[];
}

const STATUS_LABELS: Record<QuestionStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  answered: "Answered",
  archived: "Archived",
};

const STATUS_COLORS: Record<QuestionStatus, string> = {
  open: "text-[#C9A84C]",
  in_progress: "text-blue-400",
  answered: "text-green-400",
  archived: "text-[#4A5A6A]",
};

export function QuestionsPanel({
  projectId,
  questions,
  onQuestionsChanged,
  projectNotes,
}: QuestionsPanelProps) {
  const [adding, setAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [saving, setSaving] = useState(false);
  const [linkingId, setLinkingId] = useState<string | null>(null);

  async function handleAddQuestion() {
    if (!newQuestion.trim()) return;
    setSaving(true);

    const { data, error } = await createQuestion({
      project_id: projectId,
      question: newQuestion.trim(),
    });

    setSaving(false);

    if (!error && data) {
      onQuestionsChanged([...questions, { ...data, answered_by_note: null }]);
      setNewQuestion("");
      setAdding(false);
    }
  }

  async function handleStatusChange(id: string, status: QuestionStatus) {
    const { data, error } = await updateQuestionStatus(id, status);
    if (!error && data) {
      onQuestionsChanged(
        questions.map((q) =>
          q.id === id ? { ...q, status, answered_by_note_id: data.answered_by_note_id } : q
        )
      );
    }
  }

  async function handleLinkNote(questionId: string, noteId: string) {
    const { data, error } = await updateQuestionStatus(
      questionId,
      "answered",
      noteId
    );

    if (!error && data) {
      const linkedNote = projectNotes.find((n) => n.id === noteId);
      onQuestionsChanged(
        questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                status: "answered",
                answered_by_note_id: noteId,
                answered_by_note: linkedNote
                  ? { id: linkedNote.id, title: linkedNote.title }
                  : null,
              }
            : q
        )
      );
      setLinkingId(null);
    }
  }

  async function handleDelete(id: string) {
    const { error } = await deleteQuestion(id);
    if (!error) {
      onQuestionsChanged(questions.filter((q) => q.id !== id));
    }
  }

  const activeQuestions = questions.filter(
    (q) => q.status !== "archived"
  );

  return (
    <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#C9A84C]" />
          <h3 className="text-sm font-medium text-[#C9A84C]">
            Open Questions
            {activeQuestions.length > 0 && (
              <span className="ml-2 text-xs font-normal text-[#4A5A6A]">
                ({activeQuestions.length})
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
            Add
          </button>
        )}
      </div>

      {activeQuestions.length === 0 && !adding && (
        <p className="text-sm text-[#4A5A6A] italic">
          No open questions. Add one to track unresolved creative decisions.
        </p>
      )}

      {activeQuestions.length > 0 && (
        <ul className="space-y-3 mb-3">
          {activeQuestions.map((q) => (
            <li key={q.id} className="group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#C8D6E5] leading-relaxed">
                    {q.question}
                  </p>

                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <select
                      value={q.status}
                      onChange={(e) =>
                        handleStatusChange(q.id, e.target.value as QuestionStatus)
                      }
                      className="text-xs rounded bg-[#0F1623] border border-[#2A3A52] px-2 py-1 focus:outline-none focus:border-[#C9A84C] cursor-pointer"
                      style={{ color: STATUS_COLORS[q.status].replace("text-", "") }}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>

                    {q.answered_by_note ? (
                      <Link
                        href={`/projects/${projectId}/notes/${q.answered_by_note.id}`}
                        className="text-xs text-green-400 hover:underline"
                      >
                        Answered by: {q.answered_by_note.title}
                      </Link>
                    ) : (
                      projectNotes.length > 0 && (
                        linkingId === q.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              onChange={(e) => handleLinkNote(q.id, e.target.value)}
                              className="text-xs rounded bg-[#0F1623] border border-[#2A3A52] px-2 py-1 text-[#C8D6E5] focus:outline-none focus:border-[#C9A84C]"
                              defaultValue=""
                            >
                              <option value="" disabled>Select note...</option>
                              {projectNotes.map((n) => (
                                <option key={n.id} value={n.id}>{n.title}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => setLinkingId(null)}
                              className="text-xs text-[#8A9BB0] hover:text-[#F5ECD7]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setLinkingId(q.id)}
                            className="text-xs text-[#8A9BB0] hover:text-[#C9A84C] transition-colors"
                          >
                            Link to note
                          </button>
                        )
                      )
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(q.id)}
                  className="text-[#4A5A6A] hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100 mt-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <div className="space-y-2 mt-3">
          <input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="w-full rounded-lg bg-[#0F1623] border border-[#2A3A52] text-[#F5ECD7] text-sm px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
            placeholder="What creative question needs answering?"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddQuestion();
              }
            }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddQuestion}
              disabled={saving || !newQuestion.trim()}
              className="inline-flex items-center gap-1 rounded-lg bg-[#C9A84C] px-3 py-1.5 text-xs font-medium text-[#0F1623] hover:bg-[#D4B86A] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Add
            </button>
            <button
              onClick={() => { setAdding(false); setNewQuestion(""); }}
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