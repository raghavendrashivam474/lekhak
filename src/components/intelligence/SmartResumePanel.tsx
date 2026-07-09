"use client";

import Link from "next/link";
import { Clock, Sparkles, ArrowRight } from "lucide-react";
import type { SmartResumeContext } from "@/types/intelligence";

interface SmartResumePanelProps {
  projectId: string;
  resume: SmartResumeContext;
}

export function SmartResumePanel({ projectId, resume }: SmartResumePanelProps) {
  return (
    <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333]/50 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-[#C9A84C]" />
        <h2 className="text-sm font-medium text-[#C9A84C]">Where you left off</h2>
      </div>

      <div className="space-y-2.5">
        {resume.goal && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-[#8A9BB0] shrink-0">Goal</span>
            <span className="text-sm text-[#C8D6E5] text-right line-clamp-2">
              {resume.goal}
            </span>
          </div>
        )}

        {resume.current_focus && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-[#8A9BB0] shrink-0">Current focus</span>
            <span className="text-sm text-[#C8D6E5] text-right line-clamp-2">
              {resume.current_focus}
            </span>
          </div>
        )}

        {resume.next_step && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-[#8A9BB0] shrink-0">Next step</span>
            <span className="text-sm text-[#C8D6E5] text-right line-clamp-2">
              {resume.next_step}
            </span>
          </div>
        )}

        {resume.last_active_days_ago !== null && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-[#8A9BB0] shrink-0">Last worked on</span>
            <span className="text-sm text-[#C8D6E5]">
              {resume.last_active_days_ago === 0
                ? "today"
                : resume.last_active_days_ago === 1
                ? "yesterday"
                : resume.last_active_days_ago + " days ago"}
            </span>
          </div>
        )}

        {resume.recent_note_updates > 0 && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-[#8A9BB0] shrink-0">Recent changes</span>
            <span className="text-sm text-[#C8D6E5]">
              {resume.recent_note_updates} note{resume.recent_note_updates !== 1 ? "s" : ""} updated
            </span>
          </div>
        )}

        {resume.unanswered_questions > 0 && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-[#8A9BB0] shrink-0">Open questions</span>
            <span className="text-sm text-[#C9A84C]">
              {resume.unanswered_questions} unresolved
            </span>
          </div>
        )}

        {resume.most_recent_note && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-[#8A9BB0] shrink-0">Most recent note</span>
            <Link
              href={"/projects/" + projectId + "/notes/" + resume.most_recent_note.id}
              className="text-sm text-[#C9A84C] hover:underline truncate max-w-[200px]"
            >
              {resume.most_recent_note.title}
            </Link>
          </div>
        )}
      </div>

      {resume.suggested_starting_point && (
        <div className="border-t border-[#2A3A52] pt-3">
          <p className="text-xs text-[#4A5A6A] mb-1">Suggested starting point</p>
          <p className="text-sm text-[#F5ECD7] font-medium">
            {resume.suggested_starting_point}
          </p>
        </div>
      )}

      {resume.suggested_next_action && (
        <div className="flex items-start gap-3 rounded-lg bg-[#0F1623] border border-[#C9A84C]/30 p-3">
          <Sparkles className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#4A5A6A] mb-0.5">Suggested next action</p>
            <p className="text-sm text-[#C8D6E5]">{resume.suggested_next_action}</p>
          </div>
        </div>
      )}
    </div>
  );
}