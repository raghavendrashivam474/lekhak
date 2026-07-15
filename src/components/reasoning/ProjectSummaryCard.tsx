// src/components/reasoning/ProjectSummaryCard.tsx
"use client";

import { Layers, HelpCircle, GitBranch, AlertTriangle } from "lucide-react";

interface ProjectSummaryCardProps {
  threadCount: number;
  blockerCount: number;
  overallProgress: number;
  healthLabel: string;
}

export function ProjectSummaryCard({
  threadCount,
  blockerCount,
  overallProgress,
  healthLabel,
}: ProjectSummaryCardProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-4 text-center">
        <Layers className="h-4 w-4 text-[#C9A84C] mx-auto mb-1" />
        <p className="text-lg font-semibold text-[#F5ECD7]">{threadCount}</p>
        <p className="text-xs text-[#4A5A6A]">Threads</p>
      </div>
      <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-4 text-center">
        <GitBranch className="h-4 w-4 text-[#C9A84C] mx-auto mb-1" />
        <p className="text-lg font-semibold text-[#F5ECD7]">{overallProgress}%</p>
        <p className="text-xs text-[#4A5A6A]">Progress</p>
      </div>
      <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-4 text-center">
        <AlertTriangle className="h-4 w-4 text-orange-400 mx-auto mb-1" />
        <p className="text-lg font-semibold text-[#F5ECD7]">{blockerCount}</p>
        <p className="text-xs text-[#4A5A6A]">Blockers</p>
      </div>
      <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-4 text-center">
        <HelpCircle className="h-4 w-4 text-blue-400 mx-auto mb-1" />
        <p className="text-lg font-semibold text-[#F5ECD7]">{healthLabel}</p>
        <p className="text-xs text-[#4A5A6A]">Health</p>
      </div>
    </div>
  );
}
