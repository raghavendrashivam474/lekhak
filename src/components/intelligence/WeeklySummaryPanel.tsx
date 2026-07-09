"use client";

import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import type { WeeklySummary } from "@/types/intelligence";

interface WeeklySummaryPanelProps {
  summary: WeeklySummary;
}

export function WeeklySummaryPanel({ summary }: WeeklySummaryPanelProps) {
  const hasActivity =
    summary.notes_created > 0 ||
    summary.notes_updated > 0 ||
    summary.questions_answered > 0;

  if (!hasActivity && !summary.suggested_project_to_continue) return null;

  return (
    <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-[#C9A84C]" />
        <h3 className="text-sm font-medium text-[#C9A84C]">This Week</h3>
      </div>

      {hasActivity && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg bg-[#0F1623] border border-[#2A3A52] p-3">
            <p className="text-xs text-[#4A5A6A] mb-1">Notes Created</p>
            <p className="text-2xl font-semibold text-[#F5ECD7]">
              {summary.notes_created}
            </p>
          </div>
          <div className="rounded-lg bg-[#0F1623] border border-[#2A3A52] p-3">
            <p className="text-xs text-[#4A5A6A] mb-1">Notes Updated</p>
            <p className="text-2xl font-semibold text-[#F5ECD7]">
              {summary.notes_updated}
            </p>
          </div>
          <div className="rounded-lg bg-[#0F1623] border border-[#2A3A52] p-3">
            <p className="text-xs text-[#4A5A6A] mb-1">Questions Answered</p>
            <p className="text-2xl font-semibold text-green-400">
              {summary.questions_answered}
            </p>
          </div>
        </div>
      )}

      {(summary.most_active_project || summary.most_productive_collection) && (
        <div className="space-y-2 pb-3 border-b border-[#2A3A52] mb-3">
          {summary.most_active_project && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#4A5A6A]">Most active project</span>
              <Link
                href={"/projects/" + summary.most_active_project.id}
                className="text-xs text-[#C9A84C] hover:underline truncate max-w-[200px]"
              >
                {summary.most_active_project.title}
              </Link>
            </div>
          )}
          {summary.most_productive_collection && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#4A5A6A]">Most productive collection</span>
              <span className="text-xs text-[#C8D6E5]">
                {summary.most_productive_collection}
              </span>
            </div>
          )}
        </div>
      )}

      {summary.suggested_project_to_continue && (
        <Link
          href={"/projects/" + summary.suggested_project_to_continue.id}
          className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#0F1623] border border-[#C9A84C]/30 hover:border-[#C9A84C] transition-colors group"
        >
          <div className="min-w-0">
            <p className="text-xs text-[#4A5A6A] mb-0.5">Continue with</p>
            <p className="text-sm font-medium text-[#F5ECD7] truncate">
              {summary.suggested_project_to_continue.title}
            </p>
            <p className="text-xs text-[#4A5A6A] mt-0.5">
              {summary.suggested_project_to_continue.reason}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-[#C9A84C] shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}