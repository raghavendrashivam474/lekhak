"use client";

import Link from "next/link";
import { Lightbulb, Link2Off, Compass, Puzzle, HelpCircle } from "lucide-react";
import type {
  OrphanInsight,
  FocusDrift,
  CreativeGap,
  QuestionIntelligence,
} from "@/types/intelligence";

interface InsightsPanelProps {
  projectId: string;
  orphans: OrphanInsight;
  focusDrift: FocusDrift;
  gaps: CreativeGap[];
  questions: QuestionIntelligence;
}

export function InsightsPanel({
  projectId,
  orphans,
  focusDrift,
  gaps,
  questions,
}: InsightsPanelProps) {
  const hasAnyInsight =
    orphans.orphan_count > 0 ||
    orphans.untagged_count > 0 ||
    orphans.unused_collection_count > 0 ||
    (focusDrift.has_focus && focusDrift.drifting) ||
    gaps.length > 0 ||
    (questions.oldest_open_question &&
      questions.oldest_open_question.days_open >= 7);

  if (!hasAnyInsight) {
    return (
      <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-[#C9A84C]" />
          <h3 className="text-sm font-medium text-[#C9A84C]">Insights</h3>
        </div>
        <p className="text-sm text-[#4A5A6A] italic">
          No observations right now. Everything looks aligned.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-4 w-4 text-[#C9A84C]" />
        <h3 className="text-sm font-medium text-[#C9A84C]">Insights</h3>
      </div>

      <ul className="space-y-3">
        {orphans.orphan_count > 0 && (
          <li className="flex items-start gap-3">
            <Link2Off className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-[#C8D6E5]">
                {orphans.orphan_count} note{orphans.orphan_count !== 1 ? "s" : ""} without any relationships
              </p>
              <p className="text-xs text-[#4A5A6A]">
                Consider connecting them to strengthen your project.
              </p>
            </div>
          </li>
        )}

        {orphans.untagged_count >= 3 && (
          <li className="flex items-start gap-3">
            <Puzzle className="h-4 w-4 text-[#C9A84C] mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-[#C8D6E5]">
                {orphans.untagged_count} note{orphans.untagged_count !== 1 ? "s" : ""} without knowledge tags
              </p>
              <p className="text-xs text-[#4A5A6A]">
                Tags help surface connections later.
              </p>
            </div>
          </li>
        )}

        {orphans.unused_collection_count > 0 && (
          <li className="flex items-start gap-3">
            <Puzzle className="h-4 w-4 text-[#8A9BB0] mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-[#C8D6E5]">
                {orphans.unused_collection_count} unused collection{orphans.unused_collection_count !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-[#4A5A6A]">
                Consider assigning notes or archiving.
              </p>
            </div>
          </li>
        )}

        {focusDrift.has_focus && focusDrift.drifting && (
          <li className="flex items-start gap-3">
            <Compass className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-[#C8D6E5]">{focusDrift.message}</p>
              <p className="text-xs text-[#4A5A6A]">
                Focus: {focusDrift.focus_text}
              </p>
              {focusDrift.recent_categories.length > 0 && (
                <p className="text-xs text-[#4A5A6A]">
                  Recent work: {focusDrift.recent_categories.join(", ")}
                </p>
              )}
            </div>
          </li>
        )}

        {questions.oldest_open_question &&
          questions.oldest_open_question.days_open >= 7 && (
            <li className="flex items-start gap-3">
              <HelpCircle className="h-4 w-4 text-[#C9A84C] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-[#C8D6E5]">
                  Oldest open question — {questions.oldest_open_question.days_open} days
                </p>
                <p className="text-xs text-[#4A5A6A] line-clamp-2">
                  {questions.oldest_open_question.question}
                </p>
              </div>
            </li>
          )}

        {gaps.map((gap, i) => (
          <li key={i} className="flex items-start gap-3">
            <Puzzle className="h-4 w-4 text-[#8A9BB0] mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-[#C8D6E5]">{gap.label}</p>
              <p className="text-xs text-[#4A5A6A]">{gap.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}