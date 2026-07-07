"use client";

import { Activity } from "lucide-react";
import type { ProjectHealth } from "@/types/collection";

interface ProjectHealthPanelProps {
  health: ProjectHealth;
}

export function ProjectHealthPanel({ health }: ProjectHealthPanelProps) {
  const connectionRate =
    health.total_notes > 0
      ? Math.round((health.connected_notes / health.total_notes) * 100)
      : 0;

  const answerRate =
    health.total_questions > 0
      ? Math.round((health.answered_questions / health.total_questions) * 100)
      : 0;

  return (
    <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-[#C9A84C]" />
        <h3 className="text-sm font-medium text-[#C9A84C]">Project Health</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-[#0F1623] border border-[#2A3A52] p-3">
          <p className="text-xs text-[#4A5A6A] mb-1">Notes</p>
          <p className="text-2xl font-semibold text-[#F5ECD7]">{health.total_notes}</p>
        </div>

        <div className="rounded-lg bg-[#0F1623] border border-[#2A3A52] p-3">
          <p className="text-xs text-[#4A5A6A] mb-1">Connected</p>
          <p className="text-2xl font-semibold text-[#F5ECD7]">{health.connected_notes}</p>
          {health.total_notes > 0 && (
            <p className="text-xs text-[#4A5A6A]">{connectionRate}%</p>
          )}
        </div>

        <div className="rounded-lg bg-[#0F1623] border border-[#2A3A52] p-3">
          <p className="text-xs text-[#4A5A6A] mb-1">Orphaned</p>
          <p className={"text-2xl font-semibold " + (health.orphan_notes > 0 ? "text-[#C9A84C]" : "text-[#F5ECD7]")}>
            {health.orphan_notes}
          </p>
          {health.orphan_notes > 0 && (
            <p className="text-xs text-[#4A5A6A]">unconnected</p>
          )}
        </div>

        <div className="rounded-lg bg-[#0F1623] border border-[#2A3A52] p-3">
          <p className="text-xs text-[#4A5A6A] mb-1">Collections</p>
          <p className="text-2xl font-semibold text-[#F5ECD7]">{health.total_collections}</p>
        </div>
      </div>

      {health.total_questions > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-[#0F1623] border border-[#2A3A52] p-3">
            <p className="text-xs text-[#4A5A6A] mb-1">Questions</p>
            <p className="text-2xl font-semibold text-[#F5ECD7]">{health.total_questions}</p>
          </div>
          <div className="rounded-lg bg-[#0F1623] border border-[#2A3A52] p-3">
            <p className="text-xs text-[#4A5A6A] mb-1">Open</p>
            <p className={"text-2xl font-semibold " + (health.open_questions > 0 ? "text-[#C9A84C]" : "text-[#F5ECD7]")}>
              {health.open_questions}
            </p>
          </div>
          <div className="rounded-lg bg-[#0F1623] border border-[#2A3A52] p-3">
            <p className="text-xs text-[#4A5A6A] mb-1">Answered</p>
            <p className="text-2xl font-semibold text-green-400">{health.answered_questions}</p>
            {health.total_questions > 0 && (
              <p className="text-xs text-[#4A5A6A]">{answerRate}%</p>
            )}
          </div>
        </div>
      )}

      {health.total_relationships > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs text-[#4A5A6A] border-t border-[#2A3A52] pt-3">
          <span>{health.total_relationships} relationship{health.total_relationships !== 1 ? "s" : ""} total</span>
          {health.most_active_collection && (
            <span>Most active: <span className="text-[#C8D6E5]">{health.most_active_collection}</span></span>
          )}
        </div>
      )}
    </div>
  );
}